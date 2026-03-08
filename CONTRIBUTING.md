# Contributing to ODIPA Website

Thank you for your interest in contributing to ODIPA's open-source website. This project exists because we believe that building our digital presence in public — with community input — is consistent with our mission of transparency and privacy advocacy.

## Before You Start

1. **Read the [README](README.md)** to understand the tech stack and project structure
2. **Check existing [Issues](https://github.com/odipa/odipa-website/issues)** to avoid duplicating work
3. **Open an Issue** to discuss significant changes before starting work

## Ways to Contribute

### 🐛 Bug Reports
Open an issue using the Bug Report template. Include:
- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS information
- Screenshots if relevant

### ✨ Feature Requests
Open an issue using the Feature Request template. Describe:
- The problem you're solving
- Your proposed solution
- Alternatives you considered

### 📝 Content Updates
For text changes, statistics updates, or new program descriptions:
- Open a pull request with the specific change
- Cite your source for any updated statistics
- Keep ODIPA's voice: clear, authoritative, accessible

### 🌐 Translations
We are actively seeking translations into:
- Spanish (priority — large LA community)
- Mandarin
- Other languages serving ODIPA's communities

Open an issue tagged `translation` to coordinate.

### ♿ Accessibility
We are committed to WCAG 2.1 AA compliance. Accessibility PRs are prioritized.

### 💻 Code Contributions
See the Development Setup section below.

---

## Development Setup

```bash
git clone https://github.com/odipa/odipa-website.git
cd odipa-website
npm install
npm run dev
```

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b fix/your-description
   # or
   git checkout -b feat/your-description
   ```
3. **Make your changes** following the coding standards below
4. **Test locally** — run `npm run build` to ensure the static export succeeds
5. **Run linting**: `npm run lint`
6. **Submit a PR** against `main` with a clear description of your changes

## Coding Standards

- **TypeScript** — all new files must be typed; avoid `any`
- **Tailwind CSS** — use utility classes; avoid custom CSS unless necessary
- **Components** — keep components focused and single-purpose
- **Accessibility** — semantic HTML, ARIA labels where needed, keyboard navigation
- **Performance** — images must use Next.js `Image` component; avoid large dependencies

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add newsletter signup form
fix: correct donut chart percentages
docs: update contributing guidelines
style: improve mobile nav spacing
a11y: add aria-labels to program cards
content: update privacy statistics for 2025
```

## Content License

The MIT license covers the **code** in this repository. ODIPA's branding, logo, name, and written content remain the property of ODIPA. Contributions of content become property of ODIPA upon acceptance.

## Code of Conduct

By contributing, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Reach out at **dev@odipa.org** or open a GitHub Discussion.
