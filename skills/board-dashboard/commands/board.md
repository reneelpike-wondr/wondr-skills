Show the full task board dashboard.

Instructions:

1. List all files in `~/board/_active/` using ls
2. For each project file, read it and extract:
   - Project name (from the # heading)
   - Count of open items (lines with `- [ ]`)
   - Count of in-progress items (lines with `- [~]`)
   - Count of done items (lines with `- [x]`)
   - Last updated date from frontmatter
3. Read `~/board/_quick.md` and count open/in-progress/done
4. Read `~/board/_ideas.md` and count open/in-progress/done
5. Format as a compact table:

**Task Board** (date)

| Project | Open | Active | Done | Updated |
|---------|------|--------|------|---------|

**Quick Tasks**: X open, Y done
**Ideas**: X ideas, Y explored

6. If the user provided arguments below, show full detail for the matching project instead of the summary table.

User context: $ARGUMENTS
