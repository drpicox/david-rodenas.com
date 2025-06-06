# Styling Guide for Interactive Components

This guide outlines the styling standards for interactive components (like simulators) to ensure they blend seamlessly with the terminal-style theme of this portfolio website.

## Terminal Theme System

This website uses a retro terminal aesthetic with a CSS custom property-based theming system that supports both light and dark modes. All interactive components should follow these guidelines to maintain visual consistency.

### Available CSS Custom Properties

```css
/* Core theme colors */
--background      /* Main background color */
--foreground      /* Main text color */
--accent          /* Green - primary highlights, success states */
--secondary       /* Cyan - secondary highlights, info states */
--tertiary        /* Magenta - tertiary highlights, special states */
--highlight       /* Yellow - warnings, important highlights */
--error           /* Red - errors, danger states */
```

### Theme-aware Styling Patterns

#### Container Styling
```jsx
// ✅ Correct - Terminal-themed container
<div 
  className="border border-current rounded p-4 mb-4" 
  style={{ backgroundColor: 'var(--background)' }}
>

// ❌ Incorrect - Modern web styling
<div className="bg-white rounded-lg shadow-md p-4 mb-4">
```

#### Typography
```jsx
// ✅ Correct - Using theme colors
<h1 style={{ color: 'var(--accent)' }}>Title</h1>
<p style={{ color: 'var(--foreground)' }}>Body text</p>
<span style={{ color: 'var(--foreground)', opacity: 0.7 }}>Muted text</span>

// ❌ Incorrect - Hardcoded colors
<h1 className="text-blue-600">Title</h1>
<p className="text-slate-800">Body text</p>
<span className="text-slate-500">Muted text</span>
```

#### Color Semantic Mapping
- **Green (`--accent`)**: Clean development, success, positive metrics
- **Red (`--error`)**: Technical debt, errors, negative metrics
- **Cyan (`--secondary`)**: Information, secondary actions
- **Magenta (`--tertiary`)**: Special states, unique features
- **Yellow (`--highlight`)**: Warnings, important callouts

#### Interactive Elements
```jsx
// ✅ Correct - Theme-aware form controls
<input 
  className="w-full h-1 rounded-lg appearance-none cursor-pointer slider"
  style={{ background: 'var(--foreground)', opacity: 0.3 }}
/>

// CSS for slider thumbs
.slider::-webkit-slider-thumb {
  background: var(--accent);
}
.slider::-webkit-slider-thumb:hover {
  background: var(--secondary);
}
```

#### Metrics/Data Cards
```jsx
// ✅ Correct - Consistent card styling
<div 
  className="border border-current rounded p-3 flex-1" 
  style={{ 
    backgroundColor: 'var(--background)', 
    borderLeftColor: 'var(--accent)', 
    borderLeftWidth: '4px' 
  }}
>
  <div style={{ color: 'var(--accent)' }}>
    <Icon className="w-4 h-4" />
    <span className="text-xs font-semibold">Label</span>
  </div>
  <div className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
    Value
  </div>
  <div className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
    unit
  </div>
</div>
```

## Chart Integration (Recharts)

When using charting libraries like Recharts, use CSS custom properties for consistency:

```jsx
// ✅ Correct - Theme-aware charts
<Line
  stroke="var(--accent)"
  dot={{ fill: "var(--accent)", r: 2 }}
/>
<Bar
  fill="var(--error)"
/>

// ❌ Incorrect - Hardcoded colors
<Line
  stroke="#10b981"
  dot={{ fill: "#10b981", r: 2 }}
/>
```

## Component Integration Pattern

### 1. Component Registration
Add new components to the registry in `src/components/Markdown/Markdown.tsx`:

```tsx
const componentRegistry = {
  TechnicalDebtSimulator,
  YourNewSimulator, // Add here
} as const;
```

### 2. Markdown Usage
Use the self-closing tag syntax in markdown files:

```markdown
## Interactive Simulation

<YourNewSimulator />

## Additional Content
```

### 3. Dynamic Import
Use Next.js dynamic imports for better performance:

```tsx
const YourNewSimulator = dynamic(
  () => import("../../features/simulators/YourNewSimulator"),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading simulator...</div>,
  },
);
```

## Layout Guidelines

### Overall Structure
```jsx
<div 
  className="w-full max-w-6xl mx-auto my-8 p-6 border border-current rounded-lg" 
  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
>
  {/* Header */}
  <div className="border border-current rounded p-4 mb-4">
    <h1 style={{ color: 'var(--accent)' }}>Component Title</h1>
    <p style={{ color: 'var(--foreground)' }}>Description</p>
  </div>

  {/* Controls */}
  <div className="border border-current rounded p-4 mb-4">
    {/* Interactive controls */}
  </div>

  {/* Content/Results */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    {/* Charts, metrics, etc. */}
  </div>

  {/* Insights */}
  <div className="border border-current rounded p-4">
    {/* Key insights or summary */}
  </div>
</div>
```

### Responsive Design
- Use CSS Grid and Flexbox for responsive layouts
- Maximum width: `max-w-6xl` for optimal reading
- Mobile-first approach with `grid-cols-1 lg:grid-cols-2` patterns

## Typography Scale

- **Titles**: `text-2xl font-bold` with `color: 'var(--accent)'`
- **Headings**: `text-sm font-semibold` with `color: 'var(--accent)'`
- **Body**: Base size with `color: 'var(--foreground)'`
- **Small text**: `text-xs` with `color: 'var(--foreground)', opacity: 0.7`
- **Monospace values**: Add `font-mono` class for data/metrics

## Testing Your Component

1. **Light/Dark mode**: Test both themes by switching via the terminal's `theme` command
2. **Responsive**: Test on mobile and desktop viewports
3. **Integration**: Verify the component renders properly in markdown context
4. **Performance**: Ensure dynamic loading works correctly

## Examples

### ✅ Good Example
```jsx
const MySimulator = () => {
  return (
    <div 
      className="w-full max-w-6xl mx-auto my-8 p-6 border border-current rounded-lg" 
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="border border-current rounded p-4 mb-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
          My Simulator
        </h1>
      </div>
    </div>
  );
};
```

### ❌ Bad Example
```jsx
const MySimulator = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-blue-600 text-2xl font-bold">
        My Simulator
      </h1>
    </div>
  );
};
```

## Key Principles

1. **Consistency**: Always use CSS custom properties instead of hardcoded colors
2. **Adaptability**: Components should work in both light and dark themes
3. **Integration**: Match the terminal aesthetic with borders and monospace fonts
4. **Accessibility**: Maintain good contrast ratios in both themes
5. **Performance**: Use dynamic imports for large interactive components

Following these guidelines ensures that all interactive components feel like natural extensions of the terminal interface rather than foreign elements.