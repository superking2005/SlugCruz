import { test, expect, type Page } from "@playwright/test";

const baseURL: string = "http://localhost:8081";

const rideDetails = {
  from: "San Francisco",
  to: "Los Angeles",
  date: "2025-08-15",
  time: "09:00",
  seats: "2",
  phone: "555-123-4567",
};

test.describe("Signup Screen Navigation", () => {
  test('should navigate to the signin page when the "Sign In" link is clicked', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(`${baseURL}`);

    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/.*signin/);
  });
});

test.describe("Log in using Brennan's account", () => {
  test("should navigate to the signin page and then log in", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(`${baseURL}`);

    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/.*signin/);

    await page
      .getByPlaceholder("Enter your UCSC email")
      .fill("brlchan@ucsc.edu");

    await page.getByPlaceholder("Enter your password").fill("12345678");

    await page.getByText("Sign In", { exact: true }).click();

    await expect(page).toHaveURL(/.*driver/);
  });
});

test.describe("Toggle to driver ", () => {
  test("should log in, then go to profile page and toggle", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(`${baseURL}`);

    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/.*signin/);

    await page
      .getByPlaceholder("Enter your UCSC email")
      .fill("brlchan@ucsc.edu");

    await page.getByPlaceholder("Enter your password").fill("12345678");

    await page.getByText("Sign In", { exact: true }).click();
    await expect(page).toHaveURL(/.*driver/);

    await page.getByRole("tab", { name: "Profile" }).click();

    const isRiderMode = (await page.getByText("Rider Mode").count()) > 0;

    if (isRiderMode) {
      console.log("Currently in Rider Mode. Toggling to Driver Mode...");

      await page.getByTestId("mode-toggle-switch").click();
    } else {
      console.log("Already in Driver Mode. No action needed.");
      await expect(page.getByText("Driver Mode")).toBeVisible();
    }

    await expect(page.getByText("Driver Mode")).toBeVisible();
    await expect(page.getByText("Rider Mode")).not.toBeVisible();
  });
});

test.describe("Create ride in driver mode", () => {
  test("should log in, toggle to driver mode, navigate", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto(`${baseURL}`);

    await page.getByRole("link", { name: "Sign In" }).click();

    await expect(page).toHaveURL(/.*signin/);

    await page
      .getByPlaceholder("Enter your UCSC email")
      .fill("brlchan@ucsc.edu");

    await page.getByPlaceholder("Enter your password").fill("12345678");

    await page.getByText("Sign In", { exact: true }).click();
    await expect(page).toHaveURL(/.*driver/);

    await page.getByRole("tab", { name: "Profile" }).click();

    const isRiderMode = (await page.getByText("Rider Mode").count()) > 0;

    if (isRiderMode) {
      console.log("Currently in Rider Mode. Toggling to Driver Mode...");

      await page.getByTestId("mode-toggle-switch").click();
    } else {
      console.log("Already in Driver Mode. No action needed.");
      await expect(page.getByText("Driver Mode")).toBeVisible();
    }

    await expect(page.getByText("Driver Mode")).toBeVisible();
    await expect(page.getByText("Rider Mode")).not.toBeVisible();

    await page.getByRole("tab", { name: "Driver" }).click();

    await page.getByPlaceholder("From").fill(rideDetails.from);
    await page.getByPlaceholder("To").fill(rideDetails.to);
    await page
      .getByPlaceholder("Date (e.g., 2025-07-10)")
      .fill(rideDetails.date);
    await page.getByPlaceholder("Time (e.g., 14:30)").fill(rideDetails.time);
    await page.getByPlaceholder("Seats Available").fill(rideDetails.seats);
    await page.getByPlaceholder("Phone Number").fill(rideDetails.phone);

    await page.getByRole("button", { name: "Post Ride" }).click();
  });
});

//will have to relogin for each individual test due to browser contexts (https://playwright.dev/docs/browser-contexts)
