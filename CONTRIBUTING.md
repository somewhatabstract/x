# Contributing to `x`

🙇Thank you for your interest in contributing to this 📦.

Whether raising an issue, reviewing a pull request, or implementing a change, the participation of others is a wonderful 🎁. Read on to find out how you can get involved.

📖 Be sure to read our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🛑 Bugs And Feature Requests

If you find a bug or want to make enhancements to the project, head on over to the [🔗Issues](https://github.com/somewhatabstract/x/issues) section and raise an issue. The issue templates will guide you in providing details that will help others help you.

## 💻 Code Changes

### ⓵ Making your first change

Look for bugs or feature requests with the [good first issue](https://github.com/somewhatabstract/x/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/somewhatabstract/x/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+) labels and have a go at implementing a change. Once your change is ready, you can submit a pull request.

### 🎬 Getting Started

To work in the `x` repository, follow these steps:

1. Clone the repository
   - `gh repo clone somewhatabstract/x`
   - -or-
   - `git clone git@github.com:somewhatabstract/x.git`
2. Install `pnpm`
   - `corepack enable pnpm`
   - `corepack prepare pnpm --activate`
3. Run `pnpm install` (or `pnpm i`) to install the dependencies

You can now work on `x`. We prefer [🔗Visual Studio Code](https://code.visualstudio.com/) as our development environment (it's cross-platform and awesome), but please use what you feel comfortable with (we'll even forgive you for using vim).

### 🧪 Code Quality

#### Manual

We love code reviews. If there are open pull requests, please feel free to review them and provide feedback. Feedback is a gift and code reviews are often a bottleneck in getting new things released. Jump in, even if you don't know anything; you probably know more than you think.

💭**REMEMBER** Be kind and considerate. Folks are volunteering their time and code reviews are a moment of vulnerability where a criticism of the code can easily become a criticism of the individual that wrote it.

1. Take your time
2. Consider how you might receive the feedback you are giving if it were attached to code you wrote
3. Favor asking questions over prescribing solutions.

#### Automated

To ensure code quality, we use TypeScript, biome, and vitest. These are all executed when you submit a pull request to ensure contributions meet our code quality standards.

To execute these operations outside of a pull request, you can use `pnpm`.

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`

If you make changes that change snapshots, you may need to run tests with the `-u` vitest option and commit the updated snapshot files along with the rest of your contribution.

💭**REMEMBER** If you would like to contribute code changes to the project, first make sure there's a corresponding issue for the change you wish to make.

## 📦 Build And Publish

Anyone can create a local build of the distributed code by running `pnpm build`.

Running the build will execute tests first.

### Publishing

Publishing is automated through our use of [changesets][1]. When a PR is merged to `main`, a release PR is created that bundles all the changes since the last release. When we are ready to release, this bundled PR is merged to `main` which triggers changesets to publish to npm via trusted publishing.

[1]:https://github.com/changesets/changesets/blob/main/README.md#documentation
