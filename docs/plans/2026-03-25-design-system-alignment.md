# Design System Full Alignment Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the sidebar to the dark-themed styled components, create a white logo variant, and replace all hardcoded colors across layout components with design system tokens.

**Architecture:** The sidebar in `LeftSideMenu.tsx` currently uses inline `sx` props with a light theme. We'll rewrite it to import and use the dark-themed styled components from `LeftSideMenu/LeftSideMenu.style.ts`. All other layout components will be updated to reference MUI theme palette tokens instead of raw hex values.

**Tech Stack:** React, MUI 5 (styled + sx), TypeScript, Tabler Icons

---

## Color Mapping Reference

Use this mapping when replacing hardcoded colors:

| Hardcoded | Theme Token | Notes |
|-----------|------------|-------|
| `#0f172a` | `primary.900` / `neutral.1000` | Dark navy |
| `#1e293b` | `primary.800` / `neutral.900` | |
| `#334155` | `primary.700` / `neutral.800` | |
| `#475569` | `primary.600` / `neutral.700` | |
| `#64748b` | `primary.500` / `neutral.600` | |
| `#94a3b8` | `primary.400` / `neutral.500` | |
| `#cbd5e1` | `primary.300` / `neutral.400` | |
| `#e2e8f0` | `primary.200` / `neutral.300` | |
| `#f1f5f9` | `primary.100` / `neutral.200` | |
| `#f8fafc` | `primary.50` / `neutral.100` | |
| `#2563eb` | `accent.main` / via theme `primary.main` | Blue accent |
| `#1d4ed8` | `accent.hover` / via theme `primary.dark` | Blue hover |
| `#507DA0` | Keep as-is (brand teal, not in token system yet) | |
| `#AAAAAA` | `neutral.500` (`#94a3b8`) | Closest match |
| `#515151` | `neutral.700` (`#475569`) | Closest match |
| `#767373` | `neutral.600` (`#64748b`) | Closest match |
| `#475467` | `neutral.700` (`#475569`) | Nearly identical |
| `#FF5C93` | `error.300` (`#dc2626`) | Unify to theme error |
| `#FF0000` | `error.300` (`#dc2626`) | Unify to theme error |
| `red` | `error.300` (`#dc2626`) | Unify to theme error |
| `#E1E1E1` | `neutral.300` (`#e2e8f0`) | Closest match |
| `#F1F1F1` | `neutral.200` (`#f1f5f9`) | Closest match |
| `#e3e3e4` | `neutral.300` (`#e2e8f0`) | Closest match |
| `#cbcbcb` | `neutral.400` (`#cbd5e1`) | Closest match |
| `#333` | `neutral.1000` (`#0f172a`) | Dark text |
| `#EE3E42` | `error.300` (`#dc2626`) | Model badge |
| `#2596be` | `primary.main` (`#2563eb`) | Settings icon |
| `#84D65A` | `success.300` (`#16a34a`) | Toast success |
| `black` | `common.black` | Via theme |

---

### Task 1: Create White Logo SVG for Dark Sidebar

**Files:**
- Create: `src/assets/kalabria-logo-white.svg`

**Step 1: Create the white variant**

Copy `kalabria-logo.svg` and change the dark fills to white:
- Change `fill="#333333"` (the "kalabria" text) to `fill="#FFFFFF"`
- Change `fill="#C2C2C2"` (the "Powered by Hedgehog" subtext) to `fill="rgba(255,255,255,0.6)"`
- Keep the icon paths as-is (they use brand colors that read well on dark)

**Step 2: Verify file exists**

Run: `ls src/assets/kalabria-logo-white.svg`
Expected: file listed

**Step 3: Commit**

```bash
git add src/assets/kalabria-logo-white.svg
git commit -m "feat: add white logo variant for dark sidebar"
```

---

### Task 2: Rewrite LeftSideMenu.tsx to Use Dark Styled Components

**Files:**
- Modify: `src/components/layouts/LeftSideMenu.tsx` (full rewrite)
- Modify: `src/components/layouts/LeftSideMenu/LeftSideMenu.style.ts` (minor updates)

**Step 1: Update LeftSideMenu.style.ts**

Update the styled components to use theme tokens instead of hardcoded hex values where possible. Key changes:
- `ToggleButton`: change `"#e2e8f0"` border to theme-aware if desired (low priority, keep for now)
- `NavText`: ensure `color: "whitesmoke"` works on dark bg (it does - keep)
- `SidebarDrawer`, `SidebarToolbar`, `SidebarContainer`: already use `#0f172a` - acceptable since they're in a style file

No functional changes needed - the styled components are already well-designed for the dark theme.

**Step 2: Rewrite LeftSideMenu.tsx**

Replace the entire component to:
1. Import styled components from `./LeftSideMenu/LeftSideMenu.style`
2. Import the white logo `kalabria-logo-white.svg`
3. Use `S.SidebarDrawer` instead of raw `<Drawer>`
4. Use `S.SidebarToolbar` instead of raw `<Toolbar>`
5. Use `S.SidebarContainer` instead of raw `<Container>`
6. Use `S.SectionTitle` for "Menu" and "AI Tools" headings
7. Use `S.CustomListItemWrapper` + `S.CustomListItemButton` + `S.NavText` for nav items
8. Use `S.CustomDivider` instead of raw `<Divider>`
9. Use `S.MainContent` for the main content area
10. Keep auth logic (useCognito, isAdmin) intact
11. Note: The styled sidebar does NOT support `isSidebarOpen` toggle yet (hardcode to `true` for now - collapsible is a future feature)

The rewritten component should look like:

```tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { List } from "@mui/material";
import { IconHome2 } from "@tabler/icons-react";
import { prototypeRoutes } from "../../constants/routes";
import useCognito from "../../hooks/useCognito";
import { useEffect, useCallback } from "react";
import logo from "../../assets/kalabria-logo-white.svg";
import S from "./LeftSideMenu/LeftSideMenu.style";

const SideMenu = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { fetchUserSession } = useCognito();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const isSidebarOpen = true; // Future: make this stateful for collapse

  const checkIfUserIsAdmin = useCallback(async () => {
    const isAdmin = await fetchUserSession();
    setIsAdmin(isAdmin);
  }, [fetchUserSession]);

  useEffect(() => {
    checkIfUserIsAdmin();
  }, [checkIfUserIsAdmin]);

  const CustomListItem = ({
    text,
    path,
    icon,
  }: {
    text: string;
    path: string;
    icon: React.ReactNode;
  }) => {
    const isActive = window.location.pathname === path;

    return (
      <S.CustomListItemWrapper>
        <S.CustomListItemButton
          isActive={isActive}
          isHoverDisabled={false}
          onClick={() => navigate(path)}
        >
          <S.IconContainer>{icon}</S.IconContainer>
          {isSidebarOpen && (
            <S.NavText isActive={isActive}>{text}</S.NavText>
          )}
        </S.CustomListItemButton>
      </S.CustomListItemWrapper>
    );
  };

  return (
    <S.MainContainer>
      <S.SidebarDrawer
        variant="permanent"
        anchor="left"
        isSidebarOpen={isSidebarOpen}
      >
        <S.SidebarToolbar isSidebarOpen={isSidebarOpen}>
          <S.Logo src={logo} />
        </S.SidebarToolbar>
        <S.CustomDivider />
        <S.SidebarContainer disableGutters>
          <List>
            <S.SectionTitle isSidebarOpen={isSidebarOpen}>
              Menu
            </S.SectionTitle>
            <CustomListItem
              text="Dashboard"
              path="/dashboard"
              icon={
                <IconHome2
                  width={18}
                  height={18}
                  color={
                    window.location.pathname === "/dashboard"
                      ? "#2563eb"
                      : "rgba(255,255,255,0.5)"
                  }
                />
              }
            />
          </List>
          <List>
            <S.SectionTitle isSidebarOpen={isSidebarOpen}>
              AI Tools
            </S.SectionTitle>
            {prototypeRoutes.map((item, keyx) => (
              <CustomListItem
                key={keyx}
                text={item.title}
                icon={item.renderIcon(window.location.pathname === item.path)}
                path={item.path}
              />
            ))}
          </List>
        </S.SidebarContainer>
      </S.SidebarDrawer>
      <S.MainContent>{children}</S.MainContent>
    </S.MainContainer>
  );
};

export default SideMenu;
```

**Step 3: Update route icon colors for dark sidebar**

In `src/constants/routes.tsx`, change icon colors from light-theme values to dark-theme values:
- Active: `#507DA0` -> `#2563eb` (accent blue, pops on dark)
- Inactive: `#AAAAAA` -> `rgba(255,255,255,0.5)` (semi-transparent white on dark)

**Step 4: Run the dev server and verify**

Run: `npm start`
Expected: Dark navy sidebar with white logo, white nav text, blue active highlights

**Step 5: Commit**

```bash
git add src/components/layouts/LeftSideMenu.tsx src/components/layouts/LeftSideMenu/LeftSideMenu.style.ts src/constants/routes.tsx
git commit -m "feat: migrate sidebar to dark theme using styled components"
```

---

### Task 3: Clean Up DefaultButton.tsx

**Files:**
- Modify: `src/components/layouts/DefaultButton.tsx`

**Step 1: Replace hardcoded colors with theme tokens**

Use MUI `useTheme()` hook or `sx` prop theme callbacks. Since this component uses inline style objects, the simplest approach is to use the `useTheme` hook.

Replace:
- `"#e2e8f0"` -> `theme.palette.neutral[300]`
- `"#2563eb"` -> `theme.palette.primary.main`
- `"#cbd5e1"` -> `theme.palette.neutral[400]`
- `"#94a3b8"` -> `theme.palette.neutral[500]`
- `"#1d4ed8"` -> `theme.palette.primary.dark`
- `"#64748b"` -> `theme.palette.neutral[600]`

**Step 2: Verify the design system page still renders buttons correctly**

Run: Navigate to `/design-system` in the browser
Expected: Buttons look identical to before

**Step 3: Commit**

```bash
git add src/components/layouts/DefaultButton.tsx
git commit -m "refactor: replace hardcoded colors in DefaultButton with theme tokens"
```

---

### Task 4: Clean Up TextArea.tsx

**Files:**
- Modify: `src/components/layouts/TextArea.tsx`

**Step 1: Replace hardcoded colors**

- `"#515151"` (topText) -> `"neutral.700"` (in sx) or use theme
- `"#767373"` (description) -> `"neutral.600"`
- `"#FF5C93"` (error focus border + icon) -> `"error.main"` (resolves to `#dc2626`)
- `"1px solid red"` (error border) -> `"1px solid"` + theme error.main
- `"1px solid #E1E1E1"` (default border) -> `"1px solid #e2e8f0"` (matches neutral.300)
- `"red"` (helper text) -> `"error.main"`
- `borderRadius: "15px"` -> `borderRadius: "8px"` (match system radius)

Since the textarea uses native `<textarea>` with inline `style`, and MUI sx props can't be used on native elements, use `useTheme()` hook to access colors.

**Step 2: Verify on design system page**

Run: Navigate to `/design-system`
Expected: TextArea looks consistent with rest of design system (8px radius, unified error color)

**Step 3: Commit**

```bash
git add src/components/layouts/TextArea.tsx
git commit -m "refactor: replace hardcoded colors in TextArea with theme tokens"
```

---

### Task 5: Clean Up TextInput.tsx

**Files:**
- Modify: `src/components/layouts/TextInput.tsx`

**Step 1: Replace hardcoded colors**

- `"#515151"` (topText, bottomText helper) -> `"neutral.700"`
- `"#767373"` (description) -> `"neutral.600"`
- `"#FF5C93"` (error icon) -> `"error.main"` (in theme, `#dc2626`)
- `"red"` (error helper text) -> `"error.main"`

**Step 2: Verify on design system page**

Run: Navigate to `/design-system`
Expected: TextInput error states use consistent red, labels match design system

**Step 3: Commit**

```bash
git add src/components/layouts/TextInput.tsx
git commit -m "refactor: replace hardcoded colors in TextInput with theme tokens"
```

---

### Task 6: Clean Up FileUploader.tsx

**Files:**
- Modify: `src/components/layouts/FileUploader.tsx`

**Step 1: Replace hardcoded colors (both FileUploader and MeetingNotesFileUploader)**

Both components share the same color issues:
- `"#475467"` (icon color, text color) -> use theme `neutral.700` (`#475569`)
- `"#507DA0"` (uploaded file name) -> keep as brand color (or map to `primary.main`)
- `"#FF0000"` (trash icon, error icon, error text) -> theme `error.300` (`#dc2626`)
- `"#515151"` (helper text) -> `"neutral.700"`
- `"#767373"` (description) -> `"neutral.600"`

Since Tabler icon `color` prop takes a string, use the hex values from the theme directly. Import colors from the theme or use `useTheme()`.

**Step 2: Verify file upload UI works**

Navigate to a page that uses FileUploader and confirm styling.

**Step 3: Commit**

```bash
git add src/components/layouts/FileUploader.tsx
git commit -m "refactor: replace hardcoded colors in FileUploader with theme tokens"
```

---

### Task 7: Clean Up HeaderTitleText.tsx

**Files:**
- Modify: `src/components/layouts/HeaderTitleText.tsx`

**Step 1: Replace hardcoded colors**

- `"2px solid #f1f1f1"` (border-bottom) -> `"2px solid"` + `neutral.200` (use sx: `borderBottom: 2, borderColor: "neutral.200"`)
- `"#e3e3e4"` (user menu bg) -> `"neutral.300"`
- `"#EE3E42"` (model badge bg) -> `"error.main"`
- `"#2596be"` (settings icon) -> use `theme.palette.primary.main` or import `colors.accent.main`
- `"#333"` (menu item text, icon color) -> `"neutral.1000"` or `text.primary`
- `"#cbcbcb"` (divider) -> `"neutral.400"`
- `"0px 4px 12px rgba(0, 0, 0, 0.1)"` (menu shadow) -> use `theme.customShadows.high`
- `backgroundColor: "black"` (avatar) -> `"primary.900"` (dark navy matches brand better than pure black)

**Step 2: Verify header renders correctly**

Navigate to any page and confirm header looks correct.

**Step 3: Commit**

```bash
git add src/components/layouts/HeaderTitleText.tsx
git commit -m "refactor: replace hardcoded colors in HeaderTitleText with theme tokens"
```

---

### Task 8: Clean Up Select.tsx, Slider.tsx, Footer.tsx

**Files:**
- Modify: `src/components/layouts/Select.tsx`
- Modify: `src/components/layouts/Slider.tsx`
- Modify: `src/components/layouts/footer.tsx`

**Step 1: Select.tsx**

- `"#515151"` (topText) -> `"neutral.700"`
- `"#F1F1F1"` (border color) -> `"neutral.200"`

**Step 2: Slider.tsx**

- `"#515151"` (top text, bottom labels) -> `"neutral.700"`

**Step 3: Footer.tsx**

- `"1.4px solid #F1F1F1"` -> `"1.4px solid"` + use sx `borderColor: "neutral.200"`

**Step 4: Verify on design system page**

Navigate to `/design-system` and verify Select and Slider render correctly.

**Step 5: Commit**

```bash
git add src/components/layouts/Select.tsx src/components/layouts/Slider.tsx src/components/layouts/footer.tsx
git commit -m "refactor: replace hardcoded colors in Select, Slider, Footer with theme tokens"
```

---

### Task 9: Verify Full Application

**Step 1: Run the app**

Run: `npm start`

**Step 2: Visual check all pages**

- `/dashboard` - dark sidebar, white logo, readable nav items, correct header
- `/route-assistant` - active state highlights correctly in sidebar
- `/audio-to-text` - active state highlights correctly
- `/design-system` - all components render with correct colors

**Step 3: Check for any remaining hardcoded colors**

Run: `grep -rn "#515151\|#767373\|#FF5C93\|#AAAAAA\|#FF0000\|#E1E1E1\|#F1F1F1\|#e3e3e4\|#475467\|#cbcbcb\|#EE3E42\|#2596be" src/components/layouts/ src/constants/routes.tsx`

Expected: No matches (all replaced)

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve any remaining hardcoded color references"
```
