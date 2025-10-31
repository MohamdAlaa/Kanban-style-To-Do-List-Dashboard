"use client";

import { useEffect, useRef } from "react";

const JQueryDynamicList = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Dynamically load jQuery if not already loaded
    const loadjQuery = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).jQuery) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
        script.integrity =
          "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=";
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    loadjQuery().then(() => {
      const $ = (window as any).jQuery;

      if (!containerRef.current || !$) return;

      const $container = $(containerRef.current);

      // Create the HTML structure
      const html = `
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">✨ jQuery Dynamic List (Bonus Task)</h5>
            
            <div class="input-group mb-3">
              <input 
                type="text" 
                id="itemInput" 
                class="form-control" 
                placeholder="Enter item name..."
              />
              <button id="addButton" class="btn btn-primary" type="button">
                Add Item
              </button>
            </div>
            
            <div id="errorMessage" class="alert alert-danger mb-3" style="display: none;">
              Please enter an item name!
            </div>
            
            <div class="border-top pt-3">
              <h6 class="mb-2">Items List:</h6>
              <ul id="itemsList" class="list-group">
                <li class="list-group-item text-muted" style="border: none; padding: 0;">
                  No items yet
                </li>
              </ul>
            </div>
          </div>
        </div>
      `;

      $container.html(html);

      const $input = $("#itemInput");
      const $addButton = $("#addButton");
      const $errorMessage = $("#errorMessage");
      const $itemsList = $("#itemsList");

      // Add item button click handler
      $addButton.on("click", function () {
        const itemValue = $input.val() as string;

        // Check if input is empty
        if (!itemValue || itemValue.trim() === "") {
          $errorMessage.fadeIn();

          // Fade out error after 2 seconds
          setTimeout(() => {
            $errorMessage.fadeOut();
          }, 2000);
          return;
        }

        // Remove "No items yet" placeholder if exists
        if ($itemsList.children(".text-muted").length > 0) {
          $itemsList.empty();
        }

        // Create list item
        const $listItem = $(
          `<li class="list-group-item d-flex justify-content-between align-items-center fade-in-item">
            <span>${itemValue.trim()}</span>
            <button class="btn btn-sm btn-outline-danger delete-btn" type="button">
              🗑️ Delete
            </button>
          </li>`
        );

        // Add delete button handler
        $listItem.find(".delete-btn").on("click", function () {
          $(this)
            .closest("li")
            .fadeOut(300, function () {
              $(this).remove();

              // Show "No items yet" if list is empty
              if ($itemsList.children().length === 0) {
                $itemsList.append(
                  '<li class="list-group-item text-muted" style="border: none; padding: 0;">No items yet</li>'
                );
              }
            });
        });

        // Add item to list with fade-in animation
        $listItem.hide().appendTo($itemsList).fadeIn(300);

        // Clear input
        $input.val("");

        // Focus back on input
        $input.focus();
      });

      // Allow adding items with Enter key
      $input.on("keypress", function (e: any) {
        if (e.which === 13) {
          // Enter key
          $addButton.click();
        }
      });

      // Cleanup jQuery events on unmount
      return () => {
        $container.off();
      };
    });
  }, []);

  return <div ref={containerRef}></div>;
};

export default JQueryDynamicList;
