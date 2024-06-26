import { Player } from "@minecraft/server";
import { ActionFormResponse } from "@minecraft/server-ui";

declare class ChestFormData {
	/**
	 * @param size The size of the chest. Can be 'small' or 'large'.
	 */
	constructor(size?: string);
	/**
	 * @remarks This builder method sets the title for the chest ui.
	 * @param text The title text for the chest ui.
	 */
	title(text: string): ChestFormData;
	/**
	 * @remarks Adds a button to this chest ui with an icon from a resource pack.
	 * @param slot The slot to display the item in.
	 * @param itemName The name of the item to display.
	 * @param itemDesc The item's lore to display.
	 * @param iconPath The icon for the item.
	 * @param stackAmount The stack size for the item.
	 */
	button(slot: number, itemName?: string, itemDesc?: string[], iconPath?: string, stackAmount?: number): ChestFormData;
	/**
	  * @remarks
	  * Creates and shows this modal popup form. Returns
	  * asynchronously when the player confirms or cancels the
	  * dialog.
	  *
	  * This function can't be called in read-only mode.
	  *
	  * @param player
	  * Player to show this dialog to.
	 */
	show(player: Player): Promise<ActionFormResponse>;
}
export { ChestFormData };