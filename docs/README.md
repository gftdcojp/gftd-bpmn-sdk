# @gftd/bpmn-sdk Documentation

This directory contains the GitHub Pages documentation for the @gftd/bpmn-sdk project.

## 📁 Directory Structure

```
docs/
├── index.html          # Main documentation page
├── .nojekyll          # Disables Jekyll processing
├── README.md          # This file
└── api/               # TypeDoc generated API documentation (coming soon)
```

## 🚀 GitHub Pages Setup

This documentation is served via GitHub Pages with the following configuration:

- **Source**: Deploy from a branch
- **Branch**: `main`
- **Folder**: `/docs`

### URL

When enabled, the documentation will be available at:
```
https://gftdcojp.github.io/gftd-bpmn-sdk/
```

## 📝 Development

### Adding Content

1. Edit `index.html` for main documentation content
2. Run `pnpm docs` to generate API documentation in `api/` folder
3. Commit and push changes to trigger automatic deployment

### Local Development

To preview the documentation locally:

```bash
# Serve the docs directory
npx http-server docs -p 8080

# Or using the npm script
pnpm docs:serve
```

## 🔧 Configuration

### GitHub Pages Settings

To enable GitHub Pages for this repository:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Under **Branch**, select **main** and **/docs** folder
4. Click **Save**

### Custom Domain (Optional)

To use a custom domain:

1. Create a `CNAME` file in the `docs/` directory
2. Add your domain name (e.g., `docs.example.com`)
3. Configure DNS settings as per GitHub's documentation

## 📊 Status

- ✅ Basic documentation page created
- 🔄 API documentation generation (TypeDoc)
- 🔄 Automated deployment pipeline

## 🤝 Contributing

When contributing to documentation:

1. Update `index.html` with new features or changes
2. Ensure all links are working
3. Test locally before committing
4. Follow the existing HTML/CSS structure

## 📞 Support

For questions about the documentation or GitHub Pages setup:

- [GitHub Issues](https://github.com/gftdcojp/gftd-bpmn-sdk/issues)
- [GitHub Discussions](https://github.com/gftdcojp/gftd-bpmn-sdk/discussions)
