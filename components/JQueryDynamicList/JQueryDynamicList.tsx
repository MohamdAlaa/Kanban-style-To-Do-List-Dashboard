"use client";

import { useEffect, useRef } from "react";

const JQueryDynamicList = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      const html = `
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">jQuery Dynamic List</h5>
            
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

      $addButton.on("click", function () {
        const itemValue = $input.val() as string;

        if (!itemValue || itemValue.trim() === "") {
          $errorMessage.fadeIn();

          setTimeout(() => {
            $errorMessage.fadeOut();
          }, 2000);
          return;
        }

        if ($itemsList.children(".text-muted").length > 0) {
          $itemsList.empty();
        }

        const $listItem = $(
          `<li class="list-group-item d-flex justify-content-between align-items-center fade-in-item">
            <span>${itemValue.trim()}</span>
            <button class="btn btn-sm btn-outline-danger delete-btn" type="button">
            
              Delete
            </button>
          </li>`
        );

        $listItem.find(".delete-btn").on("click", function (this: HTMLElement) {
          const $button = $(this);
          $button.closest("li").fadeOut(300, function (this: HTMLElement) {
            $(this).remove();

            if ($itemsList.children().length === 0) {
              $itemsList.append(
                '<li class="list-group-item text-muted" style="border: none; padding: 0;">No items yet</li>'
              );
            }
          });
        });

        $listItem.hide().appendTo($itemsList).fadeIn(300);

        $input.val("");

        $input.focus();
      });

      $input.on("keypress", function (e: any) {
        if (e.which === 13) {
          $addButton.click();
        }
      });

      return () => {
        $container.off();
      };
    });
  }, []);

  return <div ref={containerRef}></div>;
};

export default JQueryDynamicList;
