import { ContentView } from "@/components/ContentView";

export default async function Home() {
  return (
    <ContentView initialPath="~" initialCommands={["cat README.md", "ls"]} />
  );
}
