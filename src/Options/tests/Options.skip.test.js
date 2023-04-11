import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Options from "../Options.jsx";

describe("Options", () => {
  it("adds a white list item", async () => {
    render(<Options />);
    fireEvent.change(screen.getByPlaceholderText("i.e www.google.com"), { target: { value: "www.example.com" } });
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => screen.getByText("www.example.com"));
  });

  it("adds a property and its aliases", async () => {
    render(<Options />);
    fireEvent.change(screen.getByPlaceholderText("i.e Email, First Name"), { target: { value: "TestName" } });
    fireEvent.change(screen.getByPlaceholderText("i.e Value for the field"), { target: { value: "TestValue" } });
    fireEvent.click(screen.getByText("Add Property"));

    await waitFor(() => screen.getByText("TestName:"));

    fireEvent.change(screen.getByPlaceholderText("Add alias"), { target: { value: "TestAlias" } });
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => screen.getByText("TestAlias"));
  });

  it("deletes a property", async () => {
    render(<Options />);
    fireEvent.change(screen.getByPlaceholderText("i.e Email, First Name"), { target: { value: "TestName" } });
    fireEvent.change(screen.getByPlaceholderText("i.e Value for the field"), { target: { value: "TestValue" } });
    fireEvent.click(screen.getByText("Add Property"));

    await waitFor(() => screen.getByText("TestName:"));
    fireEvent.click(screen.getByTitle("Delete Property"));

    await waitFor(() => expect(screen.queryByText("TestName:")).toBeNull());
  });
});
