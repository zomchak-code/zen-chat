<script lang="ts">
  import { browser } from "$app/environment";
  import { ENV } from "$lib/util/env";
  import { useConvexClient } from "convex-svelte";

  import { mode } from "mode-watcher";

  if (browser) {
    let win: any = window;

    const script = document.createElement("script");
    script.src = "https://do.featurebase.app/js/sdk.js";
    script.id = "featurebase-sdk";
    document.head.appendChild(script);

    async function initFeaturebase() {
      if (typeof win.Featurebase !== "function") {
        win.Featurebase = function () {
          (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
        };
      }

      // const user = await convex.action(api.featurebase.verify, {});

      // win.Featurebase(
      //   "identify",
      //   {
      //     // Each 'identify' call should include an "organization" property,
      //     // which is your Featurebase board's name before the ".featurebase.app".
      //     organization: ENV.VITE_FEATUREBASE_ORGANIZATION,
      //     // Required fields. Replace with your customers data.
      //     name: user.name,
      //     email: user.email,
      //     id: user.subject,
      //     // Both email and userId should be provided when possible
      //     // At minimum, either email or userId must be present
      //     userHash: user.userHash,

      //     // Optional - add a profile picture to the user
      //     profilePicture: user.pictureUrl,
      //     // Optional - include other fields as needed
      //     // customFields: {
      //     //   title: "Product Manager",
      //     //   plan: "Premium",
      //     //   number: "123",
      //     // },
      //     // Optional - add user company information as needed
      //     // companies: [
      //     //   {
      //     //     id: "987654321", // required
      //     //     name: "Business Inc. 23", // required
      //     //     monthlySpend: 500, // optional
      //     //     createdAt: "2023-05-19T15:35:49.915Z", // optional
      //     //     customFields: {
      //     //       industry: "Fintech",
      //     //       location: "Canada",
      //     //       language: "French",
      //     //     }, // optional
      //     //   },
      //     // ], // optional
      //   },
      //   (err: unknown) => {
      //     // Callback function. Called when identify completed.
      //     if (err) {
      //       // console.error(err);
      //     } else {
      //       // console.log("Data sent successfully!");
      //     }
      //   },
      // ),
      win.Featurebase("initialize_feedback_widget", {
        organization: ENV.VITE_FEATUREBASE_ORGANIZATION,
        theme: mode.current,
        placement: "right", // optional - remove to hide the floating button
        // email: "youruser@example.com", // optional
        locale: "en",
        // defaultBoard: "yourboardname", // optional - preselect a board
        // metadata: null // Attach session-specific metadata to feedback. Refer to the advanced section for the details: https://help.featurebase.app/en/articles/3774671-advanced#7k8iriyap66
      });
    }

    $effect(() => {
      initFeaturebase();
    });
  }
</script>

<!-- If you wish to open the widget using your own button you can do so here.
	  	 To get rid of our floating button, remove 'placement' from the Featurebase('initialize_feedback_widget') call above.
	  -->
<!-- <button data-featurebase-feedback>Open Widget</button> -->
