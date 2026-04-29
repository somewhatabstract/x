import {describe, expect, it, vi} from "vitest";
import {generateSplash} from "../generate-splash";
import * as UseColor from "../use-color";

describe("generateSplash", () => {
    it("should generate a splash screen string with ANSI colors when useColor returns true", () => {
        // Arrange
        vi.spyOn(UseColor, "useColor").mockReturnValue(true);

        // Act
        const splash = generateSplash();

        // Assert
        expect(splash).toMatchInlineSnapshot(`
          "
                [38;2;255;45;149m██╗  [0m[38;2;46;230;255m██╗  ██╗[0m
                [38;2;255;45;149m╚██╗ [0m[38;2;46;230;255m╚██╗██╔╝[0m
                [38;2;255;45;149m ╚██╗[0m[38;2;46;230;255m ╚███╔╝[0m
                [38;2;255;45;149m ██╔╝[0m[38;2;46;230;255m ██╔██╗[0m
                [38;2;255;45;149m██╔╝ [0m[38;2;46;230;255m██╔╝ ██╗[0m
                [38;2;255;45;149m╚═╝  [0m[38;2;46;230;255m╚═╝  ╚═╝[0m

          [38;2;154;160;180mDISCOVER [0m[38;2;255;45;149m>[0m[38;2;154;160;180m EXECUTE [0m[38;2;255;45;149m>[0m[38;2;154;160;180m DONE[0m
          [38;2;154;160;180m─────────────────────────[0m

          "
        `);
    });

    it("should generate a splash screen without ANSI colors when useColor returns false", () => {
        // Arrange
        vi.spyOn(UseColor, "useColor").mockReturnValue(false);

        // Act
        const splash = generateSplash();

        // Assert
        expect(splash).toMatchInlineSnapshot(`
          "
                ██╗  ██╗  ██╗
                ╚██╗ ╚██╗██╔╝
                 ╚██╗ ╚███╔╝
                 ██╔╝ ██╔██╗
                ██╔╝ ██╔╝ ██╗
                ╚═╝  ╚═╝  ╚═╝

          DISCOVER > EXECUTE > DONE
          ─────────────────────────

          "
        `);
    });
});
