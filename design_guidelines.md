# Design Guidelines: Portfolio Web Application

## Design Approach
**Selected Approach:** Reference-Based (Portfolio/Creative Industry)

Drawing inspiration from modern portfolio platforms like Behance, Dribbble, and agency websites (Fantasy Interactive, Active Theory), this design prioritizes visual storytelling and project presentation. The aesthetic balances professional polish with creative expression, allowing the work to be the hero while maintaining strong navigational clarity.

**Core Principles:**
- Photography-first design where images drive the experience
- Generous whitespace to let projects breathe
- Bold, confident typography that doesn't compete with imagery
- Asymmetric layouts to create visual interest
- Seamless transitions between project states

## Typography System

**Font Stack:**
- Primary: Inter (body text, UI elements, navigation)
- Display: Space Grotesk (project titles, section headers, numbers)

**Hierarchy:**
- Hero/Project Titles: text-5xl to text-7xl, font-bold, tracking-tight
- Section Headers: text-3xl to text-4xl, font-semibold
- Subheadings: text-xl to text-2xl, font-medium
- Body Text: text-base to text-lg, font-normal, leading-relaxed
- Metadata/Labels: text-sm, font-medium, uppercase tracking-wide
- Captions: text-sm, font-normal

## Layout & Spacing System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6, p-8, p-12
- Section spacing: py-16, py-20, py-24
- Grid gaps: gap-6, gap-8, gap-12
- Element margins: mb-4, mb-6, mb-8

**Container Strategy:**
- Full-bleed hero sections: w-full
- Content containers: max-w-7xl mx-auto px-6 lg:px-8
- Text content: max-w-4xl for optimal reading

## Landing Page Design

### Hero Section
**Layout:** Asymmetric split-screen design (60vh to 80vh)
- Left side: Large, bold project title with animated text reveal
- Right side: Diagonal-cut featured project image (aspect-ratio-[4/5])
- Overlapping "View Projects" CTA button with backdrop-blur-md
- Scroll indicator at bottom

### Navigation
**Desktop:** Fixed header with backdrop-blur-lg
- Logo/Brand (left): text-xl font-bold
- Navigation links (center): text-sm uppercase tracking-wider, hover:underline decoration-2 underline-offset-8
- Admin access (right): text-sm with icon

**Mobile:** Hamburger menu with full-screen overlay transition

### Projects Grid Section
**Layout:** Masonry/Bento-box grid (not uniform grid)
- Desktop: 3-column asymmetric grid (grid-cols-12)
  - Featured projects: col-span-8 (large)
  - Standard projects: col-span-4 (medium)
  - Small highlights: col-span-4 (small)
- Tablet: 2-column grid (grid-cols-2)
- Mobile: Single column (grid-cols-1)

**Project Cards:**
- Image-first with aspect-ratio-[3/2] or aspect-ratio-[4/5] (varied)
- Hover state: scale-105 transition-transform duration-500
- Overlay gradient on hover from transparent to semi-opaque
- Project info reveals on hover:
  - Project title: text-2xl font-bold
  - Category tag: text-xs uppercase tracking-wide
  - Year/Date: text-sm

**Spacing:** gap-6 on mobile, gap-8 on desktop

### About/Introduction Section (Optional but Recommended)
**Layout:** Two-column split
- Left: Brief bio/description (max-w-2xl)
- Right: Professional photo or signature element
- Padding: py-24

### Footer
**Layout:** Two-column grid
- Left: Brand/logo, tagline, copyright
- Right: Social links (horizontal list), contact email
- Padding: py-12, border-t

## Individual Project Pages

### Project Hero
**Layout:** Full-width cinematic header (70vh)
- Large project title: text-6xl to text-8xl, font-bold, absolute positioned
- Background: Featured project image with overlay
- Breadcrumb navigation: Fixed top-left with back button
- Project metadata strip below fold:
  - Client name, project type, year, role (horizontal flex layout)
  - Text: text-sm uppercase tracking-wide

### Project Overview Section
**Layout:** Centered content block
- max-w-3xl mx-auto
- Project description: text-lg leading-relaxed
- Key details grid: 2-3 columns on desktop (Services, Timeline, Tools)
- Spacing: py-20

### Before/After Gallery
**Primary Display:** Side-by-side comparison
- Split-screen layout: grid-cols-2 gap-4 on desktop, grid-cols-1 on mobile
- "Before" label (left): Positioned absolute, text-xs uppercase
- "After" label (right): Positioned absolute, text-xs uppercase
- Images: aspect-ratio-[4/3], object-cover, rounded-lg
- Optional: Slider overlay component for interactive comparison

**Gallery Grid:** Additional photos
- 3-column grid (grid-cols-3) on desktop, 2-column on tablet, 1-column on mobile
- Images: aspect-ratio-[4/3], rounded-lg
- Lightbox functionality on click (modal overlay)
- Spacing: gap-6

### Process/Details Section
**Layout:** Alternating content blocks
- Text block (max-w-2xl) + Image block pattern
- Images: Various aspect ratios for visual rhythm (landscape, portrait, square)
- Spacing: py-16 between blocks

### Next Project Navigation
**Layout:** Full-width card linking to next project
- Background: Next project thumbnail with overlay
- Content: "Next Project" label + Project title (text-4xl)
- Hover: Zoom effect on background image
- Height: h-96

## Admin Portal Design

**Approach:** Utility-focused dashboard inspired by Linear/Notion
- Clean, functional aesthetic prioritizing efficiency
- Data-dense layouts with excellent hierarchy

### Admin Navigation
**Layout:** Sidebar navigation (w-64, fixed)
- Logo/Dashboard title at top
- Navigation links: Vertical stack with icons
  - Projects list
  - Create new project
  - Settings
- Active state: Subtle indicator (border-l-4)

### Project Management Table
**Layout:** Data table with columns:
- Thumbnail (w-20 h-20, rounded)
- Project title
- Category
- Date created
- Status badge (Draft/Published)
- Actions (Edit/Delete icons)

**Table styling:**
- Header: text-xs uppercase font-semibold
- Rows: Hover state with subtle transition
- Spacing: py-4 px-6

### Project Form (Create/Edit)
**Layout:** Single-column form (max-w-3xl)
- Field groups with clear labels
- Input fields: Full-width with focus:ring
- Image upload zones:
  - Drag-and-drop area with dashed border
  - Thumbnail preview grid for uploaded images
  - "Before" and "After" sections clearly separated
- Action buttons: Sticky footer with Save/Cancel

## Component Library

### Buttons
**Primary CTA:** px-8 py-4, rounded-full, text-base font-medium, transition-all duration-300
**Secondary:** px-6 py-3, rounded-lg, border-2
**Ghost:** px-4 py-2, underline decoration-2 underline-offset-4

### Image Overlays
**Gradient Overlays:** Linear gradients from transparent to semi-opaque for text readability on images
**Blur Backgrounds:** backdrop-blur-md for buttons/text on images

### Cards
**Project Cards:** rounded-xl, overflow-hidden, shadow-lg hover:shadow-2xl transition-shadow
**Info Cards:** rounded-lg, p-6, border

### Modals/Lightbox
**Image Lightbox:** Full-screen overlay with backdrop-blur-lg, centered image (max-w-7xl), close button (top-right), navigation arrows

## Animations

**Minimal, purposeful animations:**
- Page transitions: Fade in content with stagger effect (0.1s delay between elements)
- Image hover: scale-105 with 500ms duration
- Scroll reveals: Fade-up effect for sections entering viewport
- Gallery navigation: Crossfade between images (300ms)

**No:** Excessive parallax, continuous animations, distracting scroll effects

## Images

**Required Images:**
1. **Hero Section:** Full-bleed featured project image (landscape, high-res, 1920x1080 minimum)
2. **Project Cards:** Thumbnail images for each project (varied aspect ratios: 3:2, 4:5, 16:9)
3. **Individual Project Pages:** 
   - Hero background image (cinematic landscape shot)
   - Before/After comparison photos (matching aspect ratios, 4:3 recommended)
   - Supporting gallery images (6-12 images per project, varied compositions)
4. **About Section:** Professional photo or branding element (optional but recommended)

**Image Treatment:**
- Sharp, high-quality photography
- Consistent professional editing style across portfolio
- Strategic use of gradients/overlays for text legibility
- Rounded corners (rounded-lg to rounded-xl) for gallery images, full-bleed for heroes

## Responsive Breakpoints

**Mobile (< 768px):**
- Single column layouts
- Larger touch targets (min 44px)
- Simplified navigation (hamburger menu)
- Stacked before/after images

**Tablet (768px - 1024px):**
- 2-column grids
- Adaptive spacing (reduce py-24 to py-16)

**Desktop (> 1024px):**
- 3-column grids
- Full asymmetric layouts
- Sidebar navigation in admin

This design creates a sophisticated, photography-forward portfolio that showcases projects beautifully while maintaining professional polish and intuitive navigation.