import {beforeEach, describe, expect, it, vi} from "vitest";
import {findWorkspaceRoot} from "../find-workspace-root";
import {getAllBins} from "../get-all-bins";
import {getCompletions} from "../get-completions";

vi.mock("../find-workspace-root");
vi.mock("../get-all-bins");

describe("getCompletions", () => {
    const findWorkspaceRootMock = vi.mocked(findWorkspaceRoot);
    const getAllBinsMock = vi.mocked(getAllBins);

    beforeEach(() => {
        findWorkspaceRootMock.mockReset();
        getAllBinsMock.mockReset();
    });

    it("should return empty completions when a command is already typed", async () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", "my-tool", ""];

        // Act
        const result = await getCompletions(rawArgs);

        // Assert
        expect(result).toEqual([]);
    });

    it("should not fetch bins when a command is already typed", async () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", "my-tool", ""];

        // Act
        await getCompletions(rawArgs);

        // Assert
        expect(getAllBinsMock).not.toHaveBeenCalled();
    });

    it("should return sorted bin names when no command is typed", async () => {
        // Arrange
        findWorkspaceRootMock.mockResolvedValue("/workspace");
        getAllBinsMock.mockResolvedValue([
            {
                packageName: "pkg-a",
                packagePath: "/workspace/pkg-a",
                bins: ["bbb", "aaa"],
            },
            {
                packageName: "pkg-b",
                packagePath: "/workspace/pkg-b",
                bins: ["ccc", "aaa"],
            },
        ]);

        // Act
        const result = await getCompletions([
            "--get-yargs-completions",
            "x",
            "",
        ]);

        // Assert
        expect(result).toEqual(["aaa", "bbb", "ccc"]);
    });

    it("should return empty completions when findWorkspaceRoot throws", async () => {
        // Arrange
        findWorkspaceRootMock.mockRejectedValue(new Error("not in workspace"));

        // Act
        const result = await getCompletions([
            "--get-yargs-completions",
            "x",
            "",
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should return empty completions when getAllBins throws", async () => {
        // Arrange
        findWorkspaceRootMock.mockResolvedValue("/workspace");
        getAllBinsMock.mockRejectedValue(new Error("no packages"));

        // Act
        const result = await getCompletions([
            "--get-yargs-completions",
            "x",
            "",
        ]);

        // Assert
        expect(result).toEqual([]);
    });
});
