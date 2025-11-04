MYPROMPTS.md

This has prompts I've used for copilot coding

---

## Add multiple images to an entry

I want to implement allowing the user to upload multiple images for an entry.  
I do not want you to produce any changes yet, just a plan.  
Check out @docs/PRD.md to know about routing and architecture details.  
The desired functionality is to allow the user to upload up to 3 images (currently only one)  
The user MUST upload at least 1 image.  
The first image (in images) in the entryTable can also be refered to as the "catalogue-image"  
The new feature must also allow replacing images and removing an image - but they cannot remove the single remaining image.  
Write a plan in @docs/plans/multipleImages.md, and let me validate it before starting the implementation.

---

change the plan. allow any number of images to be stored in the database for an entry. implement UI code to only allow 3 at the moment. One image should be designated as the "primary_image" and this should be the defualt set when the first image is uploaded.
The primary_image relationship can be held in a separate table that references images.
The primary_image can be changed to any existing image when updating an entry
rewrite the plan in multipleImages.md

---

## change the plan to add a github commit after each phase and also add each phase to the FEATURES.md file. there is no need to display the plan, just update the multipleImages.md with the new plan
