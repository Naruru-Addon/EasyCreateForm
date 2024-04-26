import { world, system } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import { Forms } from "./forms";
import { config } from "./config";

// Chat
world.beforeEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;

    if (sender.hasTag("op") || sender.isOp()) {
        if (message === "create form") {
            sender.setDynamicProperty("default_config", JSON.stringify(config.default_setting));
            ev.cancel = true;
            system.run(() => {
                new Forms(sender).create_preset(true);
            });
            return;
        };
        if (message === "form list") {
            ev.cancel = true;
            system.run(() => {
                new Forms(sender).preset_list(true);
            });
            return;
        };
    };

    Property.Chat(sender, ev);
});

// ItemUse
world.beforeEvents.itemUse.subscribe(ev => {
    const { itemStack, source } = ev;

    Property.ItemUse(source, ev);
});

// EntityUse
world.beforeEvents.playerInteractWithEntity.subscribe(ev => {
    const { itemStack, player, target } = ev;

    Property.EntityUse(player, ev);
});

// BlockUse
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { block, blockFace, faceLocation, itemStackm, player } = ev;

    Property.BlockUse(player, ev);
});

// BlockPlace
world.beforeEvents.playerPlaceBlock.subscribe(ev => {
    const { face, faceLocation, itemStack, player } = ev;

    Property.BlockPlace(player, ev);
});

// BlockBreak
world.beforeEvents.playerBreakBlock.subscribe(ev => {
    const { player, brokenBlockPermutation, itemStack, itemStackAfterBreak, itemStackBeforeBreak, block } = ev;

    Property.BlockBreak(player, ev);
});

class Property {
    static async Chat(player, ev) {
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "Chat") {
                    if (json.event.ev.message === ev.message) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.cancel) ev.cancel = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };

    static async ItemUse(player, ev) {
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "ItemUse") {
                    let test = false;
                    if (json.event.ev.itemStack.id === ev.itemStack.typeId) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.itemStack.name !== "" && json.event.ev.itemStack.name === ev.itemStack.nameTag) {
                            test = true;
                        } else if (json.event.ev.itemStack.name === "") {
                            test = true;
                        };
                    };
                    if (test) {
                        if (json.event.ev.cancel) ev.cancel = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };

    static async EntityUse(player, ev) {
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "EntityUse") {
                    let test = false;
                    if (json.event.ev.target.id === ev.target.typeId) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.target.name !== "" && json.event.ev.target.name === ev.target.nameTag) {
                            test = true;
                        } else if (json.event.ev.target.name === "") {
                            test = true;
                        };
                    };
                    if (test) {
                        if (json.event.ev.cancel) ev.cancel = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };

    static async BlockUse(player, ev) {
        if (player.view) return;
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "BlockUse") {
                    let test = false;
                    if (json.event.ev.block.id === ev.block.typeId) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.block.itemStack.id === "" && json.event.ev.block.itemStack.name === "") {
                            test = true;
                        } else if (!ev.itemStack) {
                            return;
                        } else if (json.event.ev.block.itemStack.id !== "" && json.event.ev.block.itemStack.id === ev.itemStack.typeId && json.event.ev.block.itemStack.name === "") {
                            test = true;
                        } else if (json.event.ev.block.itemStack.id === "" && json.event.ev.block.itemStack.name !== "" && json.event.ev.block.itemStack.name === ev.itemStack.nameTag) {
                            test = true;
                        } else if (json.event.ev.block.itemStack.id !== "" && json.event.ev.block.itemStack.id === ev.itemStack.typeId && json.event.ev.block.itemStack.name === ev.itemStack.nameTag && json.event.ev.block.itemStack.name !== "") {
                            test = true;
                        };
                    };  
                    if (test) {
                        if (json.event.ev.cancel) ev.cancel = true;
                        player.view = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };

    static async BlockPlace(player, ev) {
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "BlockPlace") {
                    if (json.event.ev.block.id === ev.itemStack.typeId) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.cancel) ev.cancel = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };

    static async BlockBreak(player, ev) {
        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                if (json.event.evname === "BlockBreak") {
                    let test = false;
                    if (json.event.ev.block.id === ev.block.typeId) {
                        if (json.event.ev.tag) {
                            if (json.event.ev.tag.length > 0) {
                                let count = 0;
                                for (const tag of json.event.ev.tag) {
                                    count++;
                                    if (player.hasTag(tag)) break;
                                    if (!player.hasTag(tag) && json.event.ev.tag.length === count) return;
                                };
                            };
                        };
                        if (json.event.ev.block.itemStack.id === "" && json.event.ev.block.itemStack.name === "") {
                            test = true;
                        } else if (!ev.itemStack) {
                            return;
                        } else if (json.event.ev.block.itemStack.id !== "" && json.event.ev.block.itemStack.id === ev.itemStack.typeId && json.event.ev.block.itemStack.name === "") {
                            test = true;
                        } else if (json.event.ev.block.itemStack.id === "" && json.event.ev.block.itemStack.name === ev.itemStack.nameTag && json.event.ev.block.itemStack.name !== "") {
                            test = true;
                        } else if (json.event.ev.block.itemStack.id !== "" && json.event.ev.block.itemStack.id === ev.itemStack.typeId && json.event.ev.block.itemStack.name === ev.itemStack.nameTag && json.event.ev.block.itemStack.name !== "") {
                            test = true;
                        };
                    };

                    if (test) {
                        if (json.event.ev.cancel) ev.cancel = true;
                        system.run(() => {
                            new Forms(player).view(true, json);
                        });
                    };
                };
            };
        };
    };
};