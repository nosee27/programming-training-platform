#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SQL 脚本静态自检工具（无需 MySQL 环境即可运行）

用途：在没有数据库可执行的环境里，先对建表/种子脚本做一轮结构校验，避免把
      括号不配对、INSERT 列数与值数不一致这类低级错误带到答辩现场。

检查项：
  1. 括号是否配对（忽略字符串字面量与注释中的括号）
  2. 字符串字面量是否闭合
  3. CREATE TABLE 数量统计
  4. INSERT INTO ... (列清单) VALUES (值...) 的列数与每组值的个数是否一致
  5. 红线词汇扫描：「奖学金」「管理系统」

用法：python tools/check_sql.py sql/01-schema.sql sql/02-seed.sql
"""

import re
import sys
from pathlib import Path


def strip_comments(sql: str) -> str:
    """去掉 -- 行注释与 /* */ 块注释，保留等长空白以维持位置信息。"""
    out = []
    i, n = 0, len(sql)
    state = "code"
    while i < n:
        ch = sql[i]
        if state == "code":
            if ch == "-" and sql[i:i + 2] == "--":
                # 行注释（注意 -- 后通常需要空格，这里宽松处理）
                j = sql.find("\n", i)
                j = n if j == -1 else j
                out.append(" " * (j - i))
                i = j
            elif ch == "/" and sql[i:i + 2] == "/*":
                j = sql.find("*/", i + 2)
                j = n if j == -1 else j + 2
                out.append("".join("\n" if c == "\n" else " " for c in sql[i:j]))
                i = j
            else:
                out.append(ch)
                i += 1
        else:  # pragma: no cover
            out.append(ch)
            i += 1
    return "".join(out)


def split_top_level(body: str, sep: str = ",") -> list:
    """按分隔符切分，忽略括号内与字符串内的分隔符。"""
    parts, depth, buf, i, n = [], 0, [], 0, len(body)
    in_str = False
    while i < n:
        ch = body[i]
        if in_str:
            buf.append(ch)
            if ch == "\\" and i + 1 < n:
                buf.append(body[i + 1])
                i += 2
                continue
            if ch == "'":
                if i + 1 < n and body[i + 1] == "'":
                    buf.append("'")
                    i += 2
                    continue
                in_str = False
            i += 1
            continue
        if ch == "'":
            in_str = True
            buf.append(ch)
        elif ch == "(":
            depth += 1
            buf.append(ch)
        elif ch == ")":
            depth -= 1
            buf.append(ch)
        elif ch == sep and depth == 0:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
        i += 1
    if buf:
        parts.append("".join(buf))
    return parts


def check_file(path: Path) -> list:
    raw = path.read_text(encoding="utf-8")
    sql = strip_comments(raw)
    problems = []

    # 1. 括号配对
    depth = 0
    in_str = False
    i, n = 0, len(sql)
    while i < n:
        ch = sql[i]
        if in_str:
            if ch == "\\" and i + 1 < n:
                i += 2
                continue
            if ch == "'":
                if i + 1 < n and sql[i + 1] == "'":
                    i += 2
                    continue
                in_str = False
            i += 1
            continue
        if ch == "'":
            in_str = True
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth < 0:
                problems.append("括号出现多余的右括号 ')'")
                depth = 0
        i += 1
    if in_str:
        problems.append("存在未闭合的字符串字面量 '")
    if depth != 0:
        problems.append(f"括号不配对，结束时仍有 {depth} 个未闭合的 '('")

    # 2. 统计建表数量
    create_count = len(re.findall(r"\bCREATE\s+TABLE\b", sql, flags=re.IGNORECASE))

    # 3. INSERT 列数 / 值数校验
    insert_pat = re.compile(
        r"INSERT\s+INTO\s+`?(\w+)`?\s*\(([^;]*?)\)\s*VALUES\s*(.*?);",
        flags=re.IGNORECASE | re.DOTALL,
    )
    insert_count = 0
    for m in insert_pat.finditer(sql):
        table, cols_raw, values_raw = m.group(1), m.group(2), m.group(3)
        cols = [c for c in split_top_level(cols_raw) if c.strip()]
        tuples = [t for t in split_top_level(values_raw, sep=";") if t.strip()]
        # VALUES 后是 (..),(..) 形式，按顶层括号提取
        groups = re.findall(r"\(([^()]*)\)", values_raw)
        insert_count += 1
        for idx, g in enumerate(groups, start=1):
            vals = [v for v in split_top_level(g) if v.strip()]
            if len(vals) != len(cols):
                problems.append(
                    f"INSERT INTO {table} 第 {idx} 组值有 {len(vals)} 个，"
                    f"但列清单有 {len(cols)} 个"
                )
        if not groups:
            problems.append(f"INSERT INTO {table} 未解析到任何值组，请人工确认")
        del tuples

    # 4. 红线词汇扫描（只看可执行语句，注释里提到「禁止某某」不算违规）
    notes = []
    for word in ("奖学金", "管理系统"):
        code_hits = sql.count(word)
        comment_hits = raw.count(word) - code_hits
        if code_hits:
            problems.append(f"红线词汇「{word}」在可执行语句中出现 {code_hits} 次，必须清除")
        if comment_hits:
            notes.append(f"注释中出现「{word}」{comment_hits} 次（仅「禁止」说明语境）")

    return problems, {
        "create_table": create_count,
        "insert": insert_count,
        "notes": notes,
    }


def main(argv: list) -> int:
    targets = argv[1:] or ["sql/01-schema.sql", "sql/02-seed.sql"]
    failed = False
    for t in targets:
        path = Path(t)
        if not path.exists():
            print(f"[跳过] {t} 不存在")
            failed = True
            continue
        problems, stats = check_file(path)
        status = "通过" if not problems else "存在问题"
        print(f"[{status}] {t}  →  CREATE TABLE × {stats['create_table']}，INSERT × {stats['insert']}")
        for p in problems:
            print(f"    - {p}")
            failed = True
        for note in stats["notes"]:
            print(f"    · {note}")
    print("\n结论：" + ("存在需要修复的问题" if failed else "脚本结构自检全部通过"))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
