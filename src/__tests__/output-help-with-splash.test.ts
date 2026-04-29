import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {Argv} from "yargs";
import {generateSplash} from "../generate-splash";
import {outputHelpWithSplash} from "../output-help-with-splash";

vi.mock("../generate-splash");

describe("outputHelpWithSplash", () => {
    const generateSplashMock = vi.mocked(generateSplash);

    beforeEach(() => {
        generateSplashMock.mockReset();
        generateSplashMock.mockReturnValue("splash output\n");
        vi.spyOn(process.stdout, "write").mockImplementation(() => true);
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should render the splash banner before help output", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs);

        // Assert
        expect(process.stdout.write).toHaveBeenCalledWith("splash output\n");
    });

    it("should generate splash content when help is requested", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs);

        // Assert
        expect(generateSplashMock).toHaveBeenCalledOnce();
    });

    it("should render CLI help output", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs);

        // Assert
        expect(parsedYargs.showHelp).toHaveBeenCalledOnce();
    });

    it("should avoid emitting an error when no message is provided", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs);

        // Assert
        expect(console.error).not.toHaveBeenCalled();
    });

    it("should show help even when a validation message is present", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs, "Bad input");

        // Assert
        expect(parsedYargs.showHelp).toHaveBeenCalledOnce();
    });

    it("should emit the provided validation message to stderr", () => {
        // Arrange
        const parsedYargs = {
            showHelp: vi.fn(),
        } as unknown as Argv;

        // Act
        outputHelpWithSplash(parsedYargs, "Bad input");

        // Assert
        expect(console.error).toHaveBeenCalledWith("\n Bad input");
    });
});
