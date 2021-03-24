"use strict";

let allClothing = [];

function parseItems(wardrobe) {
  if (!wardrobe) return null;
  let output = wardrobe.match(/var all_items = \[.*\];/g);
  if (!output || !output.length) return null;
  output = output[0]
    .substring(16, output[0].length - 1)
    .replace(/<img src=".*?"\/>/g, "");
  try {
    output = JSON.parse(output);
    return output;
  } catch (e) {
    return null;
  }
}

function badInput() {
  $("#results").empty();
  $("#results").append(
    '<div class="col-sm-12"><div class="alert alert-danger text-center">Invalid input!</div></div>'
  );
  $("input[type=submit]").prop("disabled", false);
  $("input[type=submit]").prop("aria-disabled", false);
}

// wardrobe is an array of {id, name, description, is_clothing, rarity, hash, thumbnail_url, detailed description, tooltip, pivot {user_id, item_id}, clothing_settings{item_id, slot_id, hash, crm, cmp, hnr, tnc, luk, is_scenery, is_sortable, is_animated, display_front_image, display_back_image}}
// reference is an array of {Name, NPC, Rarity, Source, img URL, #}
function findMissing(
  wardrobe,
  reference,
  worldhopperClass,
  excludeLimited,
  excludeSeasonal
) {
  let cards = $(
    '<div class="d-flex flex-wrap" style="border: 1px solid rgba(0,0,0,.125);">'
  );

  let output = [];
  let widx = 0;

  reference.forEach((clothing) => {
    let target = wardrobe[widx] ? wardrobe[widx].id : null;
    let id = clothing["#"];

    // ignore underwear
    if (id == 0) return;
    // ignore clothing found in wardrobe
    if (id == target) {
      widx++;
      return;
    }

    if (
      (excludeLimited && clothing.Rarity === "Limited") ||
      (excludeSeasonal && clothing.Rarity === "Seasonal")
    )
      return;
    let exclusives = {
      animal: "Moira",
      elven: "Vierre",
      galactic: "Andromeda",
      human: "Declan",
      all: null,
    };
    let npcs = ["Moira", "Vierre", "Andromeda", "Declan"];
    if (
      exclusives[worldhopperClass] &&
      npcs.includes(clothing.NPC) &&
      clothing.NPC !== exclusives[worldhopperClass]
    )
      return;

    if (!target || id < target) {
      output.push(clothing);
      cards.append(
        `<div class="card col-xl-3 col-md-4 col-6"><div class="card-body"><h5 class="card-title">${clothing.Name}</h5><h6 class="card-subtitle mb-2 text-muted">${clothing.Rarity}</h6><p class="card-text d-flex justify-content-between align-items-center">${clothing.Source}<small class="text-muted">(${clothing.NPC})</small></p></div></div>`
      ); // to-do: handle n/a's better
    } else
      while (id >= wardrobe[widx].id) {
        if (id > wardrobe[widx].id)
          console.log(
            `Error! Wardrobe contains unknown clothing! wardrobe[${widx}]: ${wardrobe[widx].name}(${wardrobe[widx].id}), clothing: ${id}`
          );
        widx++;
      }
  });
  $("#results").empty();
  $("#results").append(cards);
  $("#results").prepend(
    `<h1 class="text-center">You need ${output.length} more items to complete your wardrobe!</h1><a href="#petpage-coding" class="d-block text-center mb-3">(jump to bottom)</a>`
  );
  return output;
}

function skip() {}

function generateCode(clothes) {
  let html = `<div class="body"><div class="wrapper"><div class="content"><h1>I need ${clothes.length} more items to complete my wardrobe!</h1><ul>`;
  let txt = `I need ${clothes.length} more items to complete my wardrobe!

  `;
  clothes.forEach((clothing) => {
    html += `<li>${clothing.Name}<b>${clothing.Source}</b><i>(${clothing.NPC})</i>`;
    txt += "\n" + clothing.Name;
  });
  html += "</ul></div></div></div>";
  $("#html-box").val(html);
  $("#plaintext-box").val(txt);

  let small = $("#petpage-coding small.w-100")
    .eq(0)
    .text(html.length + "/65535");
  if (html.length > 65535) {
    small.addClass("text-danger").append("&emsp; ⚠ Character count exceeded!");
  } else small.removeClass("text-danger");
  small = $("#petpage-coding small.w-100")
    .eq(1)
    .text(txt.length + "/65535");
  if (txt.length > 65535) {
    small.addClass("text-danger").append("&emsp; ⚠ Character count exceeded!");
  } else small.removeClass("text-danger");

  $("#petpage-coding").show();
}

$(document).ready(() => {
  let wardrobe = "";
  let worldhopperClass = "all";
  let excludeLimited = false;
  let excludeSeasonal = false;

  $.getJSON("src/clothing.json", (data) => {
    allClothing = data;
  }).fail(() => {
    $(".container").prepend(
      '<div class="alert alert-danger text-center">Something went wrong!</div>'
    );
  });
  let missingList = [];

  $("#form").submit((e) => {
    e.preventDefault();

    $("#results").empty();
    $("#results").append(
      '<div class=" col-12 text-center"> <div class="spinner-border" role="status"> <span class="sr-only">Loading...</span> </div> </div>'
    );

    wardrobe = $("#wardrobe-input").val();
    worldhopperClass = $("#worldhopper-class").val();
    excludeLimited = $("#exclude-limited").prop("checked");
    excludeSeasonal = $("#exclude-seasonal").prop("checked");

    wardrobe = parseItems(wardrobe);
    if (!wardrobe) {
      badInput();
      return;
    }

    missingList = findMissing(
      wardrobe,
      allClothing,
      worldhopperClass,
      excludeLimited,
      excludeSeasonal
    );
    generateCode(missingList);
  });

  $(".copy-btn").click(function () {
    $(this).parent().parent().find(".copy").select();
    document.execCommand("copy");
    $(this).text("Copied!");
  });
  $(".copy").focusout(function () {
    $(this).text("Copy");
  });
});
