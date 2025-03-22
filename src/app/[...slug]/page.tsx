import { ContentView } from "@/components/ContentView";
import { contentIndex } from "@/data/contentIndex";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams() {
  return contentIndex.files
    .map((file) => {
      // Convert '/content/path/to/file.md' to ['path', 'to', 'file']
      // Skip the '/content/' prefix and remove file extension
      let slug = file.path
        .replace(/^\/content\//, "")
        .replace(/\.md$/, "")
        .split("/");

      // Special case for README.md files which should map to the directory itself
      if (slug[slug.length - 1] === "README") {
        slug.pop();
      }

      // Special case for root README.md
      if (slug.length === 0 || (slug.length === 1 && slug[0] === "")) {
        slug = [];
      }

      return { slug };
    })
    .filter(({ slug }) => slug.length > 0);
}

export default async function ContentPage({
  params,
}: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // Special case for root path
  if (slug.length === 0) {
    return (
      <ContentView initialPath="~" initialCommands={["cat README.md", "ls"]} />
    );
  }

  // Convert slug array back to a path
  const path = slug.join("/");

  // Check if the path exists in our content index
  const contentFile = contentIndex.files.find(
    (file) =>
      file.path === `/content/${path}.md` ||
      file.path === `/content/${path}/README.md`,
  );

  if (!contentFile) {
    return notFound();
  }

  // Use the file path to create the cat command
  const initialPath = `${contentFile.path}/..`;
  const catCommand = `cat ${contentFile.path.split("/").pop()}`;

  return (
    <ContentView
      initialPath={initialPath}
      initialCommands={[catCommand, "ls"]}
    />
  );
}
