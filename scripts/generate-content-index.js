/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/generate-content-index.js
const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

// Configuration
const CONTENT_DIR = path.join(process.cwd(), "public/content");
const OUTPUT_PATH = path.join(process.cwd(), "src/data/contentIndex.ts");

// Function to extract metadata based on file type
function extractMetadata(filePath) {
  const fileExt = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const stats = fs.statSync(filePath);

  // Basic metadata for all files
  const metadata = {
    path: `/content/${relativePath.replace(/\\/g, "/")}`,
    name: path.basename(filePath),
    size: stats.size,
    modified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString(),
    type: fileExt.slice(1), // Remove the dot from extension
  };

  // Extract additional metadata based on file type
  if ([".md", ".mdx"].includes(fileExt)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const { data, excerpt } = matter(content, { excerpt: true });

      // Make sure to capture user field from frontmatter
      const user = data.user || "";

      return {
        ...metadata,
        title: data.title || path.basename(filePath, fileExt),
        description: data.description || excerpt || "",
        tags: data.tags || [],
        author: data.author || "",
        user: user, // Add user field explicitly
        date: data.date
          ? new Date(data.date).toISOString()
          : stats.mtime.toISOString(),
        ...Object.entries(data).reduce((acc, [key, value]) => {
          // Only include serializable data
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            Array.isArray(value)
          ) {
            acc[key] = value;
          }
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return metadata;
    }
  } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileExt)) {
    return {
      ...metadata,
      title: path.basename(filePath, fileExt).replace(/[-_]/g, " "),
      isImage: true,
    };
  } else if ([".pdf"].includes(fileExt)) {
    return {
      ...metadata,
      title: path.basename(filePath, fileExt).replace(/[-_]/g, " "),
      isPdf: true,
    };
  }

  return metadata;
}

// Function to recursively scan directory
function scanDirectory(dir) {
  let results = [];

  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return results;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      results = results.concat(scanDirectory(itemPath));
    } else {
      // Extract metadata for files
      const metadata = extractMetadata(itemPath);
      if (metadata) {
        results.push(metadata);
      }
    }
  }

  return results;
}

// Generate TypeScript interface from metadata
function generateTypeDefinitions(files) {
  // Collect all property keys from all files
  const allKeys = new Set();
  files.forEach((file) => {
    Object.keys(file).forEach((key) => allKeys.add(key));
  });

  // Build the interface definition
  let interfaceStr = `export interface ContentFile {\n`;

  // Required properties
  interfaceStr += `  path: string;\n`;
  interfaceStr += `  name: string;\n`;
  interfaceStr += `  size: number;\n`;
  interfaceStr += `  modified: string;\n`;
  interfaceStr += `  created: string;\n`;
  interfaceStr += `  type: string;\n`;

  // Optional properties
  const optionalProps = [...allKeys].filter(
    (key) =>
      !["path", "name", "size", "modified", "created", "type"].includes(key),
  );
  optionalProps.sort().forEach((key) => {
    // Determine the property type
    let propType = "string";

    // Check all files to determine the most appropriate type
    for (const file of files) {
      if (file[key] !== undefined) {
        const valueType = typeof file[key];

        if (valueType === "boolean") {
          propType = "boolean";
          break;
        } else if (valueType === "number") {
          propType = "number";
          break;
        } else if (Array.isArray(file[key])) {
          propType = "string[]";
          break;
        }
      }
    }

    interfaceStr += `  ${key}?: ${propType};\n`;
  });

  interfaceStr += `}\n\n`;

  // Add ContentIndex interface
  interfaceStr += `export interface ContentIndex {\n`;
  interfaceStr += `  files: ContentFile[];\n`;
  interfaceStr += `  count: number;\n`;
  interfaceStr += `  generated: string;\n`;
  interfaceStr += `}\n\n`;

  return interfaceStr;
}

// Generate the TypeScript file with content index
function generateContentIndexTS() {
  console.log("Generating content index TypeScript file...");

  try {
    // Scan the content directory
    const files = scanDirectory(CONTENT_DIR);

    if (files.length === 0) {
      console.warn(`No files found in ${CONTENT_DIR}`);
    }

    // Generate the TypeScript file content
    let tsContent = "";

    // Add interfaces
    tsContent += generateTypeDefinitions(files);

    // Add the content index
    tsContent += `// Generated content index - DO NOT EDIT MANUALLY\n`;
    tsContent += `export const contentIndex: ContentIndex = {\n`;
    tsContent += `  files: ${JSON.stringify(files, null, 2)},\n`;
    tsContent += `  count: ${files.length},\n`;
    tsContent += `  generated: "${new Date().toISOString()}"\n`;
    tsContent += `};\n\n`;

    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the TypeScript file
    fs.writeFileSync(OUTPUT_PATH, tsContent);

    console.log(`Content index TypeScript file generated: ${OUTPUT_PATH}`);
    console.log(`Total files indexed: ${files.length}`);
  } catch (error) {
    console.error("Error generating content index TypeScript file:", error);
  }
}

// Run if called directly
if (require.main === module) {
  generateContentIndexTS();
}

module.exports = { generateContentIndexTS };
