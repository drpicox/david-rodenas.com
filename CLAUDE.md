# David Rodenas Portfolio Website (v2025)

## Overview
This is a retro terminal-style developer portfolio website for David Rodenas. It's built with Next.js 15, React 19, TypeScript, and TailwindCSS. The site simulates a command-line interface where visitors can navigate using familiar commands like `ls`, `cd`, and `cat` to explore content stored as markdown files.

## Technical Stack
- Next.js 15.2
- React 19
- TypeScript
- TailwindCSS 4
- IBM Plex Mono font (for terminal aesthetics)

## Core Implementation Patterns

### Dependency Injection System
- Located in `src/utils/injector/`
- Custom implementation of dependency injection for React components
- Key classes:
  - `Injector`: Core container managing dependencies
  - `AbstractSubject`: Base class for observable subjects
  - `Subject`: Generic implementation of state containers with subscribers
- Custom hooks:
  - `useInject`: Retrieves dependencies from context
  - `useInjection`: Sets up dependencies in context

### Terminal Simulation
- `src/features/terminal/TerminalScreen.ts`: 
  - Handles display of command outputs as ReactNodes
  - Manages terminal state including scrollback buffer

### Shell Implementation
- Located in `src/features/shell/`
- Components:
  - `Shell.tsx`: Main shell component with command input and processing
  - `ShellCommandExecutor.ts`: Executes commands using the command dictionary
  - `CommandHistory.ts`: Manages history of executed commands
  - `CurrentPath.ts`: Tracks and manipulates the current working directory

### Command System
- Plugin-based architecture where commands are registered and discovered through the `ShellCommandDictionary`
- Each command implements the `Command` interface from `Command.ts`
- Available commands:
  - `ls`: List directory contents
  - `cd`: Change directory
  - `cat`: Display file contents
  - `clear`: Clear terminal screen
- Command components include interactive elements like `LinkCat` and `LinkCd` that execute commands when clicked

### Prompt System
- Located in `src/components/Prompt/`
- Features:
  - `Prompt.tsx`: Input component for the terminal
  - `usePromptCompletion.ts`: Hook for tab completion functionality
  - `usePromptHistory.ts`: Hook for navigating command history

### Content Management
- Content stored as Markdown files in `public/content/`
- Utilities in `src/utils/content/`:
  - `directories.ts`: Functions for navigating the virtual directory structure
  - `files.ts`: Functions for accessing and reading file content
- Content index generated by script in `scripts/generate-content-index.js`

## Application Flow
1. Next.js page loads the main Shell component
2. Shell initializes terminal and command system via dependency injection
3. Initial command (usually `cat ~/README.md`) is executed automatically
4. User interacts by typing commands or clicking interactive elements
5. Command output is rendered to the terminal screen

## Key Architectural Decisions
1. **Virtual File System**: Content is organized as a virtual file system, making navigation intuitive
2. **Reactive State Management**: Custom subjects provide reactive state without external libraries
3. **Component Isolation**: Command implementations are isolated, making the system extensible
4. **Interactive UI Elements**: Links in output can trigger commands, enhancing UX
5. **SSG-Ready**: Structure supports Static Site Generation for optimal performance

## Interactive Simulators System

This website supports embedding interactive React components (simulators) directly within markdown content. The system allows for rich, interactive demonstrations of software development concepts.

### Simulator Architecture
- **Component Location**: All simulators are stored in `src/features/simulators/`
- **Markdown Integration**: Components are rendered using a custom markdown processing system
- **Dynamic Loading**: Simulators are dynamically imported for optimal performance
- **Theme Integration**: All simulators follow the terminal theme system (see `STYLE.md`)

### Adding New Simulators

To add a new interactive simulator to the website, follow these steps:

#### 1. Create the Simulator Component
```bash
# Create your simulator component
touch src/features/simulators/YourSimulatorName.tsx
```

Follow the styling guidelines in `STYLE.md` to ensure visual consistency with the terminal theme.

#### 2. Register the Component
Add your component to the registry in `src/components/Markdown/Markdown.tsx`:

```tsx
// Dynamic imports for simulators
const YourSimulatorName = dynamic(
  () => import("../../features/simulators/YourSimulatorName"),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading simulator...</div>,
  },
);

// Component registry for dynamic rendering
const componentRegistry = {
  TechnicalDebtSimulator,
  YourSimulatorName, // Add here
} as const;
```

#### 3. Create Content Directory and Files
```bash
# Create directory for your simulator content
mkdir -p public/content/simulators

# Create the markdown file that will contain your simulator
touch public/content/simulators/your-simulator-name.md
```

#### 4. Add Simulator to Markdown Content
In your markdown file, use the self-closing tag syntax:

```markdown
---
title: "Your Simulator Name"
description: "Brief description of what the simulator does"
---

# Your Simulator Name

Brief introduction and explanation.

## Interactive Simulation

<YourSimulatorName />

## Additional content explaining the simulation
```

#### 5. Update Content Index
```bash
# Regenerate the content index to include your new files
node scripts/generate-content-index.js
```

#### 6. Add to Navigation (Optional)
If you want your simulator section to appear in the main menu, add it to `public/content/README.md`:

```markdown
## Main Sections

- [Your Section](/your-section) - Description of your simulators
```

### Example Implementation

See `src/features/simulators/TechnicalDebtSimulator.tsx` and `public/content/simulators/technical-debt-simulator.md` for a complete example of:
- Terminal-themed component styling
- Interactive controls (sliders, charts)
- Responsive design patterns
- Integration with the markdown system

### Styling Requirements

All simulators must follow the terminal theme system:
- Use CSS custom properties (`var(--accent)`, `var(--background)`, etc.)
- Maintain consistent borders and layouts
- Support both light and dark themes
- Follow the typography scale defined in `STYLE.md`

### Testing Your Simulator

1. Navigate to your simulator via the terminal: `cd simulators && cat your-simulator-name.md`
2. Test theme switching: `theme light` and `theme dark`
3. Verify responsive behavior on different screen sizes
4. Ensure the component loads properly in the markdown context

### Best Practices

- **Performance**: Use `dynamic` imports with `ssr: false` for heavy components
- **Accessibility**: Ensure good contrast ratios in both light and dark themes
- **User Experience**: Provide loading states and clear controls
- **Code Organization**: Keep simulator logic self-contained within the component
- **Documentation**: Include comprehensive explanations in the markdown content

## Content Structure
- `public/content/`: All site content
  - `README.md`: Initial welcome message
  - `whoami.md`: Personal information
  - `contact-links.md`: Contact information
  - `simulators/`: Interactive simulators and demonstrations
    - `README.md`: Simulators section overview
    - `technical-debt-simulator.md`: Technical debt compound interest simulator
  - `projects/`: Portfolio projects
    - Individual project markdown files

This project elegantly combines modern web technologies with a nostalgic terminal interface to create a unique developer portfolio experience, enhanced with interactive demonstrations of software development concepts.