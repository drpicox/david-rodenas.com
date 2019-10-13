---
tags:
  - yaml
description: >
    Front-matter is a ipso-facto standard 
    to add metadata to a text file by using YAML.
---

It defines the metadata inside a block
delimited with `---` lines in 
the beginning of the text file. 

Example:

```markdown
  ---
  title: Example
  tags:
      - example
      - has_frontmatter
  ---
  # This is an Example

  And metadata is above
```

Resultant JSON metadata:

```json
{
    "title": "Example",
    "tags": ["example", "has_frontmatter"]
}
```

Nowadays it is very popular thanks to tools like Jekyll or Assemble.
