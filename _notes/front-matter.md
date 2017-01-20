---
tags:
  - yaml
---
Front-matter is a ipso-facto standarized way to add metadata to a text file by using [YAML](http://www.yaml.org/) in the beginning of the file delimited by two sets of `---`. 

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
