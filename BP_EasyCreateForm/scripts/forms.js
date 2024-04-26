import { world, system } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
import { config } from "./config";
import { until } from "./until";
import { ChestFormData } from "./extensions/forms";

export class Forms {
    constructor (player) {
        this.player = player;
    };

    async view(busy, json) {
        switch (json.type) {
            case "ActionFormData": {
                const form = new UI.ActionFormData();
                form.title(json.data.title)
                .body(json.data.body.replace(/\\n/g, "\n"))
                
                for (const num in json.data.contents) {
                    if (json.data.contents[num].texture !== "") {
                        form.button(json.data.contents[num].title, json.data.contents[num].texture)
                    } else {
                        form.button(json.data.contents[num].title)
                    };
                };

                const { selection, canceled } = busy
                ? await until.formbusy(this.player, form)
                : await form.show(this.player)
                if (canceled) return;
                if (json.data.contents[selection].selection.runCommands.length > 0) {
                    for (const command of json.data.contents[selection].selection.runCommands) {
                        try {
                            this.player.runCommandAsync(command);
                        } catch {};
                    };
                };
                if (json.data.contents[selection].selection.move !== "") {
                    for (const property of world.getDynamicPropertyIds()) {
                        if (property.startsWith("customform_")) {
                            const targetjson = JSON.parse(world.getDynamicProperty(property));
                            if (targetjson.presetname === json.data.contents[selection].selection.move) {
                                system.run(() => {
                                    new Forms(this.player).view(true, targetjson);
                                });
                            };
                        };
                    };
                };
                this.player.view = false;
                return;
            };

            case "ModalFormData": {
                const form = new UI.ModalFormData();
                form.title(json.data.title)
                
                for (const content in json.data.contents) {
                    let settype = "";
                    for (const type in json.data.contents[content]) {
                        settype = type;
                    };
                    switch (settype) {
                        case "textField": {
                            form.textField(json.data.contents[content][settype].title, json.data.contents[content][settype].subtitle, json.data.contents[content][settype].inputtext)
                            break;
                        };
                        case "toggle": {
                            form.toggle(json.data.contents[content][settype].title, json.data.contents[content][settype].state)
                            break;
                        };
                        case "slider": {
                            form.slider(json.data.contents[content][settype].title, parseFloat(json.data.contents[content][settype].min), parseFloat(json.data.contents[content][settype].max), parseFloat(json.data.contents[content][settype].add), parseFloat(json.data.contents[content][settype].num))
                            break;
                        };
                        case "dropdown": {
                            form.dropdown(json.data.contents[content][settype].title, json.data.contents[content][settype].array, json.data.contents[content][settype].num)
                            break;
                        };
                    };
                };

                const { formValues, canceled } = busy
                ? await until.formbusy(this.player, form)
                : await form.show(this.player)
                if (canceled) return;
                if (json.data.formValues.runCommands.length > 0) {
                    for (const command of json.data.formValues.runCommands) {
                        let newcommand = command;
                        const regex = /<([^>]+)>/g;
                        const matches = command.replace("/", "").match(regex);

                        if (matches) {
                            for (const match of matches) {
                                const num = match.replace(/[<>]/g, "").replace("formValues", "");
                                if (formValues[parseFloat(num)] === "") continue;
                                newcommand = newcommand.replace(match, `${formValues[parseFloat(num)]}`);
                            };
                        };

                        try {
                            this.player.runCommandAsync(newcommand);
                        } catch {};
                    };
                };
                if (json.data.formValues.move !== "") {
                    for (const property of world.getDynamicPropertyIds()) {
                        if (property.startsWith("customform_")) {
                            const targetjson = JSON.parse(world.getDynamicProperty(property));
                            if (targetjson.presetname === json.data.contents[selection].selection.move) {
                                system.run(() => {
                                    new Forms(this.player).view(true, targetjson);
                                });
                            };
                        };
                    };
                };
                this.player.view = false;
                return;
            };
        
            case "MessageFormData": {
                const form = new UI.MessageFormData();
                form.title(json.data.title)
                .body(json.data.body.replace(/\\n/g, "\n"))

                for (const num in json.data.contents) {
                    if (json.data.contents[num].texture !== "") {
                        if (num == 0) form.button2(json.data.contents[num].title, json.data.contents[num].texture)
                        if (num == 1) form.button1(json.data.contents[num].title, json.data.contents[num].texture)
                    } else {
                        if (num == 0) form.button2(json.data.contents[num].title)
                        if (num == 1) form.button1(json.data.contents[num].title)
                    };
                };

                const { selection, canceled } = busy
                ? await until.formbusy(this.player, form)
                : await form.show(this.player)
                if (canceled) return;
                if (json.data.contents[selection - 1 == 0 ? selection - 1 : selection + 1].selection.runCommands.length > 0) {
                    for (const command of json.data.contents[selection - 1 == 0 ? selection - 1 : selection + 1].selection.runCommands) {
                        try {
                            this.player.runCommandAsync(command);
                        } catch {};
                    };
                };
                if (json.data.contents[selection - 1 == 0 ? selection - 1 : selection + 1].selection.move !== "") {
                    for (const property of world.getDynamicPropertyIds()) {
                        if (property.startsWith("customform_")) {
                            const targetjson = JSON.parse(world.getDynamicProperty(property));
                            if (targetjson.presetname === json.data.contents[selection].selection.move) {
                                system.run(() => {
                                    new Forms(this.player).view(true, targetjson);
                                });
                            };
                        };
                    };
                };
                this.player.view = false;
                return;
            };

            case "ChestFormData": {
                const form = new ChestFormData(json.data.chesttype);
                const contents = json.data.contents;
                form.title(json.data.title)
                
                for (const button in contents) {
                    const itemname = contents[button].itemname;
                    const itemdesc = contents[button].itemdesc;
                    const texture = contents[button].texture;
                    const amount = contents[button].amount;
                    if (itemname === "" && !itemdesc[0] && texture === "" && amount === 0) continue;
                    form.button(button, itemname, itemdesc, texture, amount)
                };

                const { selection, canceled } = busy
                ? await until.formbusy(this.player, form)
                : await form.show(this.player)
                if (canceled) return;
                const select = contents[selection].selection;
                if (select.runCommands.length > 0) {
                    for (const command of select.runCommands) {
                        try {
                            this.player.runCommandAsync(command);
                        } catch {};
                    };
                };
                if (select.move !== "") {
                    for (const property of world.getDynamicPropertyIds()) {
                        if (property.startsWith("customform_")) {
                            const targetjson = JSON.parse(world.getDynamicProperty(property));
                            if (targetjson.presetname === select.move) {
                                system.run(() => {
                                    new Forms(this.player).view(true, targetjson);
                                });
                            };
                        };
                    };
                };
                this.player.view = false;
                return;
                return;
            };
        };
    };

    async create_preset(busy, json, list, err) {
        if (!json) json = JSON.parse(this.player.getDynamicProperty("default_config"));
        const form = new UI.ActionFormData();
        let body = [
            `${err === undefined ? "" : `${err}\n`}プリセット名: §d${json.presetname}§f`,
            `タイプ: §b${json.type}§f`,
        ].join("\n");
        form.title("プリセット")
        .body(body)
        .button("§lプリセット名")
        .button("§lフォームタイプ")
        .button("§l呼び出しイベント")
        .button(`§l${json.type}を編集`)

        if (list) {
            form.button("§l削除")
            .button("§l保存")
        } else form.button("§l作成")

        const { selection, canceled } = busy
        ? await until.formbusy(this.player, form)
        : await form.show(this.player)
        if (canceled) return;
        if (selection === 0) return this.create_preset_presetname(this.player, json, list);
        if (selection === 1) return this.create_preset_type(this.player, json, list);
        if (selection === 2) return this.create_preset_events(this.player, json, list);
        if (selection === 3) return this.create_preset_form(this.player, json, list);
        if (list) {
            if (selection === 4) {
                const form = new UI.ActionFormData();
                
                form.title("確認")
                .body("§c本当に削除しますか？§f")
                .button("§lはい")
                .button("§lいいえ")

                const { selection, canceled } = await form.show(this.player);
                if (canceled) return;
                if (selection === 0) {
                    this.player.setDynamicProperty("default_config", JSON.stringify(config.default_setting));
                    world.setDynamicProperty(`customform_${json.presetname}`, undefined);
                    return;
                };
                if (selection === 1) return this.create_preset(this.player, json, list);
                return;
            };
            if (selection === 5) {
                this.player.setDynamicProperty("default_config", JSON.stringify(config.default_setting));
                world.setDynamicProperty(`customform_${json.presetname}`, JSON.stringify(json));
                new Forms(this.player).preset_list(true);
                return;
            };
        } else if (selection === 4) {
            if (json.presetname === "") return this.create_preset(this.player, json, list, "§cエラー: プリセット名を入力してください§f");
            this.player.setDynamicProperty("default_config", JSON.stringify(config.default_setting));
            world.setDynamicProperty(`customform_${json.presetname}`, JSON.stringify(json));
            this.player.sendMessage(`§e@customform§f ${json.presetname}を作成しました`);
            return;
        }
    };

    async preset_list(busy) {
        const form = new UI.ActionFormData();
        let presetlist = [];

        form.title("プリセットリスト")

        for (const property of world.getDynamicPropertyIds()) {
            if (property.startsWith("customform_")) {
                const json = JSON.parse(world.getDynamicProperty(property));
                form.button(json.presetname)
                presetlist.push(property);
            };
        };

        form.button("閉じる")

        const { selection, canceled } = busy
        ? await until.formbusy(this.player, form)
        : await form.show(this.player)
        if (canceled) return;
        if (selection === presetlist.length) return;
        const json = JSON.parse(world.getDynamicProperty(presetlist[selection]));
        this.create_preset(this.player, json, true);
    };

    async create_preset_presetname(player, json, list, data, err) {
        if (!data) data = json.presetname;
        const form = new UI.ModalFormData();
        form.title("プリセット名")
        .textField(`${err === undefined ? "" : `${err}\n`}プリセット名`, "", data)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        data = formValues[0];
        if (world.getDynamicPropertyIds().includes(`customform_${formValues[0]}`)) return this.create_preset_presetname(player, json, list, data, "§cエラー: 入力されたプリセット名はすでに使用されています§f");
        json.presetname = formValues[0];
        this.create_preset(player, json, list);
    };

    async create_preset_type(player, json, list) {
        let types = [];
        for (const type in config.reference_setting.types) {
            types.push(type);
        };
        const form = new UI.ModalFormData();
        form.title("フォームタイプ")
        .dropdown("フォームタイプ", types, types.indexOf(json.type))

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (json.type === types[formValues[0]]) return this.create_preset(player, json, list);
        check: {
            const form = new UI.ActionFormData();
            form.title("確認")
            .body("フォームタイプを変更しますか？\n§cフォームタイプを変更すると、今まで設定した編集が全て失われます§f")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                json.type = types[formValues[0]];
                json.data = Object.assign({}, config.reference_setting.types[types[formValues[0]]]);
                this.create_preset(player, json, list);
            };
            if (selection === 1) return this.create_preset(player, json, list);
        };
    };

    async create_preset_events(player, json, list) {
        const form = new UI.ActionFormData();
        let body = [
            `イベントタイプ: §a${json.event.evname}§f`
        ].join("\n");

        form.title("呼び出しイベント")
        .body(body)
        .button("§l戻る")
        .button("§lイベントタイプ")
        .button("§lイベント詳細")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.create_preset(player, json, list);
        if (selection === 1) return this.create_preset_events_type(player, json, list);
        if (selection === 2) return this.create_preset_events_ev(player, json, list);
    };

    async create_preset_events_type(player, json, list) {
        const form = new UI.ModalFormData();

        form.title("呼び出しイベント")
        .dropdown("イベントを選択してください\n※タイプを変更すると設定した詳細が削除されます", Object.keys(config.reference_setting.events), Object.keys(config.reference_setting.events).indexOf(json.event.evname))
        
        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (json.event.evname !== Object.keys(config.reference_setting.events)[formValues[0]]) {
            json.event.evname = Object.keys(config.reference_setting.events)[formValues[0]];
            json.event.ev = Object.assign({}, config.reference_setting.events[json.event.evname]);
        };
        this.create_preset_events(player, json, list);
    };

    async create_preset_events_ev(player, json, list) {
        if (!json.event.ev.tag) json.event.ev.tag = [];
        const form = new UI.ModalFormData();

        form.title("イベント詳細")
        .toggle("イベント動作キャンセル", json.event.ev.cancel)

        switch (json.event.evname) {
            case "Chat": {
                form.textField("メッセージ", "", json.event.ev.message)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
            case "ItemUse": {
                form.textField("アイテムID", "minecraft:stick", json.event.ev.itemStack.id)
                .textField("アイテム名", "", json.event.ev.itemStack.name)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
            case "EntityUse": {
                form.textField("エンティティID", "minecraft:chicken", json.event.ev.target.id)
                .textField("エンティティ名", "", json.event.ev.target.name)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
            case "BlockUse": {
                form.textField("ブロックID", "minecraft:stone", json.event.ev.block.id)
                .textField("アイテムID", "minecraft:stick", json.event.ev.block.itemStack.id)
                .textField("アイテム名", "", json.event.ev.block.itemStack.name)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
            case "BlockPlace": {
                form.textField("ブロックID", "minecraft:stone", json.event.ev.block.id)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
            case "BlockBreak": {
                form.textField("ブロックID", "minecraft:stone", json.event.ev.block.id)
                .textField("アイテムID", "minecraft:stone_pickaxe", json.event.ev.block.itemStack.id)
                .textField("アイテム名", "", json.event.ev.block.itemStack.name)
                .textField("許可タグ\n※指定しない場合は空白\n※複数セットする場合は,で区切ってください", "", json.event.ev.tag.length > 0 ? json.event.ev.tag.join(",") : "")
                break;
            };
        };

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.event.ev.cancel = formValues[0];
        switch (json.event.evname) {
            case "Chat": {
                json.event.ev.message = formValues[1];
                json.event.ev.tag = formValues[2] === "" ? [] : formValues[2].split(",");
                break;
            };
            case "ItemUse": {
                json.event.ev.itemStack.id = formValues[1];
                json.event.ev.itemStack.name = formValues[2];
                json.event.ev.tag = formValues[3] === "" ? [] : formValues[3].split(",");
                break;
            };
            case "EntityUse": {
                json.event.ev.target.id = formValues[1];
                json.event.ev.target.name = formValues[2];
                json.event.ev.tag = formValues[3] === "" ? [] : formValues[3].split(",");
                break;
            };
            case "BlockUse": {
                json.event.ev.block.id = formValues[1];
                json.event.ev.block.itemStack.id = formValues[2];
                json.event.ev.block.itemStack.name = formValues[3];
                json.event.ev.tag = formValues[4] === "" ? [] : formValues[4].split(",");
                break;
            };
            case "BlockPlace": {
                json.event.ev.block.id = formValues[1];
                json.event.ev.tag = formValues[2] === "" ? [] : formValues[2].split(",");
                break;
            };
            case "BlockBreak": {
                json.event.ev.block.id = formValues[1];
                json.event.ev.block.itemStack.id = formValues[2];
                json.event.ev.block.itemStack.name = formValues[3];
                json.event.ev.tag = formValues[4] === "" ? [] : formValues[4].split(",");
                break;
            };
        };
        this.create_preset_events(player, json, list);
    };

    async create_preset_form(player, json, list) {
        switch (json.type) {
            case "ActionFormData": {
                if (JSON.stringify(json.data) === "{}") json.data = JSON.parse(JSON.stringify(config.reference_setting.types.ActionFormData));
                Forms_ActionFormData.menu(player, json, list);
                break;
            };
            case "ModalFormData": {
                if (JSON.stringify(json.data) === "{}") json.data = JSON.parse(JSON.stringify(config.reference_setting.types.ModalFormData));
                Forms_ModalForlData.menu(player, json, list);
                break;
            };
            case "MessageFormData": {
                if (JSON.stringify(json.data) === "{}") json.data = JSON.parse(JSON.stringify(config.reference_setting.types.MessageFormData));
                Forms_MessageFormData.menu(player, json, list);
                break;
            };
            case "ChestFormData": {
                if (JSON.stringify(json.data) === "{}") json.data = JSON.parse(JSON.stringify(config.reference_setting.types.ChestFormData));
                Forms_ChestFormData.menu(player, json, list);
                break;
            };
        };
    };
};

class Forms_ActionFormData {
    static async menu(player, json, list) {
        const formjson = json.data;
        const form = new UI.ActionFormData();
        let body = [
            `ページタイトル: §d${formjson.title}§f`,
            `ボディ: §a${formjson.body}§f`,
            `ボタン数: §b${Object.keys(formjson.contents).length}§f`
        ].join("\n");

        form.title(`${json.type}の編集`)
        .body(body)
        .button("§lタイトル")
        .button("§lボディ")
        .button("§lボタン")
        .button("§lプレビュー")
        .button("§l戻る")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.title(player, json, list);
        if (selection === 1) return this.body(player, json, list);
        if (selection === 2) return this.button(player, json, list);
        if (selection === 3) return this.preview(player, json, list);
        if (selection === 4) return new Forms(player).create_preset(true, json, list);
    };

    static async title(player, json, list) {
        const formjson = json.data;
        const form = new UI.ModalFormData();

        form.title("タイトル")
        .textField("タイトル", "", formjson.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        formjson.title = formValues[0];
        this.menu(player, json, list);
    };

    static async body(player, json, list) {
        const formjson = json.data;
        const form = new UI.ModalFormData();

        form.title("ボディ")
        .textField("ボディ\n(改行するには\\nを使用してください)", "", json.body)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        formjson.body = formValues[0];
        this.menu(player, json, list);
    };

    static async button(player, json, list) {
        const form = new UI.ActionFormData();
        let contents = [];
        
        form.title("ボタン")
        .button("§l戻る")
        .button("§l作成")

        for (const num in json.data.contents) {
            contents.push(num);
            form.button(json.data.contents[num].title)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.menu(player, json, list);
        if (selection === 1) return this.button_create(player, json, undefined, list);
        this.button_select(player, json, undefined, selection - 2, list);
    };

    static async button_create(player, json, newbutton, list) {
        if (!newbutton) {
            newbutton = {
                title: "",
                texture: "",
                selection: {
                    runCommands: [],
                    move: ""
                }
            };
        };
        const form = new UI.ActionFormData();
        let body = [
            `ボタンタイトル: §d${newbutton.title}§f`,
            `ボタンテクスチャ: §a${newbutton.texture}§f`
        ].join("\n");

        form.title("ボタン作成")
        .body(body)
        .button("§l戻る")
        .button("§lタイトル")
        .button("§lテクスチャパス")
        .button("§lボタンプッシュイベント")
        .button("§l作成")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) {
            const form = new UI.ActionFormData();
            
            form.title("確認")
            .body("§c作成する前にフォームを戻ると、今までの設定が破棄されます")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) this.button(player, json, list);
            if (selection === 1) this.button_create(player, json, newbutton, list);
            return;
        };
        if (selection === 1) return this.button_create_title(player, json, newbutton, list);
        if (selection === 2) return this.button_create_texture(player, json, newbutton, list);
        if (selection === 3) return this.button_create_pushevent(player, json, newbutton, list);
        if (selection === 4) {
            const num = Object.keys(json.data.contents).length;
            json.data.contents[num] = newbutton;
            this.button(player, json, list);
            return;
        };
    };

    static async button_create_title(player, json, newbutton, list) {
        const form = new UI.ModalFormData();

        form.title("ボタンタイトル")
        .textField("ボタンタイトル", "", newbutton.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.title = formValues[0];
        this.button_create(player, json, newbutton, list);
    };

    static async button_create_texture(player, json, newbutton, list) {
        const form = new UI.ModalFormData();

        form.title("テクスチャパス")
        .textField("テクスチャパス", "", newbutton.texture)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.texture = formValues[0];
        this.button_create(player, json, newbutton, list);
    };

    static async button_create_pushevent(player, json, newbutton, list) {
        const form = new UI.ActionFormData();

        form.title("ボタンプッシュイベント")
        .button("§l戻る")
        .button("§lコマンド")
        .button("§l画面遷移")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_create(player, json, newbutton, list);
        if (selection === 1) return this.button_create_pushevent_commands(player, json, newbutton, list);
        if (selection === 2) return this.button_create_pushevent_move(player, json, newbutton, list);
    };

    static async button_create_pushevent_commands(player, json, newbutton, list) {
        const form = new UI.ActionFormData();

        form.title("コマンド")
        .button("§l戻る")
        .button("§l追加")

        for (const command of newbutton.selection.runCommands) {
            form.button(command)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_create_pushevent(player, json, newbutton, list);
        if (selection === 1) return this.button_create_pushevent_commands_add(player, json, newbutton, list);
        this.button_create_pushevent_commands_select(player, json, newbutton, selection - 2, list);
    };

    static async button_create_pushevent_commands_add(player, json, newbutton, list) {
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド", "", "")

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") return this.button_create_pushevent_commands(player, json, newbutton, list);
        newbutton.selection.runCommands.push(formValues[0].replace("/", ""));
        this.button_create_pushevent_commands(player, json, newbutton, list);
    };

    static async button_create_pushevent_commands_select(player, json, newbutton, num, list) {
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド", "", newbutton.selection.runCommands[num])

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") {
            newbutton.selection.runCommands.splice(num, 1);
            this.button_create_pushevent_commands(player, json, newbutton, list);
            return;
        };
        newbutton.selection.runCommands[num] = formValues[0].replace("/", "");
        this.button_create_pushevent_commands(player, json, newbutton, list);
    };

    static async button_create_pushevent_move(player, json, newbutton, list) {
        const form = new UI.ModalFormData();

        form.title("画面遷移")
        .textField("遷移先プリセット名", "", newbutton.selection.move)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.selection.move = formValues[0];
        this.button_create_pushevent(player, json, newbutton, list);
    };

    static async button_select(player, json, newbutton, num, list) {
        if (!newbutton) newbutton = JSON.parse(JSON.stringify(json.data.contents[num]));
        const form = new UI.ActionFormData();
        let body = [
            `ボタンタイトル: §d${newbutton.title}§f`,
            `ボタンテクスチャ: §a${newbutton.texture}§f`
        ].join("\n");

        form.title("ボタン作成")
        .body(body)
        .button("§l戻る")
        .button("§lタイトル")
        .button("§lテクスチャパス")
        .button("§lボタンプッシュイベント")
        .button("§lボタン配置変更")
        .button("§l削除")
        .button("§l保存")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) {
            const form = new UI.ActionFormData();
            
            form.title("確認")
            .body("保存する前にフォームを戻ると、ボタンが保存されませんが戻りますか？")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) this.button(player, json, list);
            if (selection === 1) this.button_select(player, json, newbutton, num, list);
            return;
        };
        if (selection === 1) return this.button_select_title(player, json, newbutton, num, list);
        if (selection === 2) return this.button_select_texture(player, json, newbutton, num, list);
        if (selection === 3) return this.button_select_pushevent(player, json, newbutton, num, list);
        if (selection === 4) return this.button_select_arrangementchange(player, json, newbutton, num, list);
        if (selection === 5) {
            const form = new UI.ActionFormData();

            form.title("確認")
            .body("§c削除すると、元に戻すことはできません。それでも削除しますか？")
            .button("§lはい")
            .button("§lいいえ")
            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                delete json.data.contents[num];
                this.button(player);
                return;
            };
            if (selection === 1) return this.button_select(player, json, newbutton, num, list);
            return;
        };
        if (selection === 6) {
            if (newbutton.arrangementchange) {
                json.data.contents[num] = json.data.contents[newbutton.arrangementchange];
                json.data.contents[newbutton.arrangementchange] = newbutton;
            } else {
                json.data.contents[num] = newbutton;
            };
            this.button(player, json, list);
            return;
        };
    };

    static async button_select_title(player, json, newbutton, num, list) {
        const form = new UI.ModalFormData();

        form.title("ボタンタイトル")
        .textField("ボタンタイトル", "", newbutton.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.title = formValues[0];
        this.button_select(player, json, newbutton, num, list);
    };

    static async button_select_texture(player, json, newbutton, num, list) {
        const form = new UI.ModalFormData();

        form.title("テクスチャパス")
        .textField("テクスチャパス", "", newbutton.texture)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.texture = formValues[0];
        this.button_select(player, json, newbutton, num, list);
    };

    static async button_select_pushevent(player, json, newbutton, num, list) {
        const form = new UI.ActionFormData();

        form.title("ボタンプッシュイベント")
        .button("§l戻る")
        .button("§lコマンド")
        .button("§l画面遷移")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_select(player, json, newbutton, num, list);
        if (selection === 1) return this.button_select_pushevent_commands(player, json, newbutton, num, list);
        if (selection === 2) return this.button_select_pushevent_move(player, json, newbutton, num, list);
    };

    static async button_select_pushevent_commands(player, json, newbutton, num, list) {
        const form = new UI.ActionFormData();

        form.title("コマンド")
        .button("§l戻る")
        .button("§l追加")

        for (const command of newbutton.selection.runCommands) {
            form.button(command)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_select_pushevent(player, json, newbutton, num, list);
        if (selection === 1) return this.button_select_pushevent_commands_add(player, json, newbutton, num, list);
        this.button_select_pushevent_commands_select(player, json, newbutton, selection - 2, num, list);
    };

    static async button_select_pushevent_commands_add(player, json, newbutton, num, list) {
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド", "", "")

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") return this.button_select_pushevent_commands(player, json, newbutton, num, list);
        newbutton.selection.runCommands.push(formValues[0].replace("/", ""));
        this.button_select_pushevent_commands(player, json, newbutton, num, list);
    };

    static async button_select_arrangementchange(player, json, newbutton, num, list) {
        let countnum = [];
        let count = 0;
        for (const num of Object.keys(json.data.contents)) {
            countnum.push(`${count}`);
            count++;
        };
        const form = new UI.ModalFormData();

        form.title("ボタン配置変更")
        .dropdown("変更場所を選択して下さい", countnum, num)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.arrangementchange = countnum[formValues[0]];
        this.button_select(player, json, newbutton, num, list);
    };

    static async button_select_pushevent_commands_select(player, json, newbutton, snum, num, list) {
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド\n空白で削除", "", newbutton.selection.runCommands[snum])

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") {
            newbutton.selection.runCommands.splice(snum, 1);
            this.button_select_pushevent_commands(player, json, newbutton, num, list);
            return;
        };
        newbutton.selection.runCommands[snum] = formValues[0].replace("/", "");
        this.button_select_pushevent_commands(player, json, newbutton, num, list);
    };

    static async button_select_pushevent_move(player, json, newbutton, num, list) {
        const form = new UI.ModalFormData();

        form.title("画面遷移")
        .textField("遷移先プリセット名", "", newbutton.selection.move)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        newbutton.selection.move = formValues[0];
        this.button_select_pushevent(player, json, newbutton, num, list);
    };

    static async preview(player, json, list) {
        if (!(Object.keys(json.data.contents).length > 0)) return this.menu(player, json);
        const form = new UI.ActionFormData();

        form.title(json.data.title)
        .body(json.data.body.replace(/\\n/g, "\n"))
        
        for (const num in json.data.contents) {
            if (json.data.contents[num].texture !== "") {
                form.button(json.data.contents[num].title, json.data.contents[num].texture)
            } else {
                form.button(json.data.contents[num].title)
            };
        };

        const { selection, canceled } = await form.show(player);
        this.menu(player, json, list);
    };
};

class Forms_ModalForlData {
    static async menu(player, json, list) {
        const formjson = json.data;
        const form = new UI.ActionFormData();
        let body = [
            `ページタイトル: §d${formjson.title}§f`,
            `ポップアップ数: §b${Object.keys(formjson.contents).length}§f`
        ].join("\n");

        form.title(`${json.type}の編集`)
        .body(body)
        .button("§lタイトル")
        .button("§lポップアップ")
        .button("§lプレビュー")
        .button("§l戻る")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.title(player, json, list);
        if (selection === 1) return this.popup(player, json, list);
        if (selection === 2) return this.preview(player, json, list);
        if (selection === 3) return new Forms(player).create_preset(true, json, list);
    };

    static async title(player, json, list) {
        const form = new UI.ModalFormData();

        form.title("タイトル")
        .textField("タイトル", "", json.data.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.title = formValues[0];
        this.menu(player, json, list);
    };

    static async popup(player, json, list) {
        const form = new UI.ActionFormData();
        let contents = [];

        form.title("ポップアップ")
        .button("§l戻る")
        .button("§lフォームバリュー")
        .button("§l作成")

        for (const num in json.data.contents) {
            contents.push(num);
            for (const type in json.data.contents[num]) {
                if (type === "formValues") continue;
                form.button(`${json.data.contents[num][type].title}\n{${type}}`)
            };
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.menu(player, json, list);
        if (selection === 1) return this.popup_formValue(player, json, list);
        if (selection === 2) return this.popup_create(player, json, undefined, list);
        this.popup_select(player, json, undefined, selection - 3, list);
    };

    static async popup_formValue(player, json, list) {
        const form = new UI.ActionFormData();

        form.title("フォームバリュー")
        .button("§l戻る")
        .button("§lコマンド")
        .button("§l画面遷移")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.popup(player, json, list);
        if (selection === 1) return this.popup_formValue_command(player, json, list);
        if (selection === 2) return this.popup_formValue_move(player, json, list);
    };

    static async popup_formValue_command(player, json, list) {
        const form = new UI.ActionFormData();
        form.title("コマンド")
        .button("§l戻る")
        .button("§l作成")

        for (const command of json.data.formValues.runCommands) {
            form.button(command)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.popup_formValue(player, json, list);
        if (selection === 1) {
            const form = new UI.ModalFormData();

            form.title("作成")
            .textField("コマンド", "", "")

            const { formValues, canceled } = await form.show(player);
            if (canceled) return;
            if (formValues[0].trim() === "") return this.popup_formValue_command(player, json, list);
            json.data.formValues.runCommands.push(formValues[0].replace("/", ""));
            this.popup_formValue_command(player, json, list);
            return;
        };
        this.popup_formValue_command_select(player, json, list, selection - 2);
    };

    static async popup_formValue_command_select(player, json, list, num) {
        const form = new UI.ModalFormData();

        form.title("コマンド")
        .textField("コマンド\n空白で削除", "", json.data.formValues.runCommands[num])

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") {
            json.data.formValues.runCommands.splice(num, 1);
            this.popup_formValue_command(player, json, list);
            return;
        };
        json.data.formValues.runCommands[num] = formValues[0].replace("/", "");
        this.popup_formValue_command(player, json, list);
    };

    static async popup_formValue_move(player, json, list) {
        const form = new UI.ModalFormData();

        form.title("画面遷移")
        .textField("遷移先プリセット名", "", json.data.formValues.move)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.formValues.move = formValues[0];
        this.popup_formValue(player, json, list);
    };

    static async popup_create(player, json, newpopup, list) {
        if (!newpopup) {
            newpopup = {
                textField: {
                    title: "",
                    subtitle: "",
                    inputtext: ""
                }
            };
        };
        let settype = "";
        const form = new UI.ActionFormData();
        for (const type in newpopup) {
            if (type === "formValues") continue;
            settype = type;
        };

        form.title("ポップアップ")
        .button("§l戻る")
        .button("§lタイプ")
        .button(`§l${settype}を編集`)
        .button("§l作成")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) {
            const form = new UI.ActionFormData();
            
            form.title("確認")
            .body("§c作成する前にフォームを戻ると、今までの設定が破棄されます")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) this.menu(player, json, newpopup, list);
            if (selection === 1) this.popup_create(player, json, newpopup, list);
            return;
        };
        if (selection === 1) return this.popup_create_type(player, json, newpopup, settype, list);
        if (selection === 2) return this.popup_create_edittype(player, json, newpopup, settype, list);
        if (selection === 3) {
            const num = Object.keys(json.data.contents).length;
            json.data.contents[num] = newpopup;
            this.popup(player, json, list);
            return;
        };
    };

    static async popup_create_type(player, json, newpopup, settype, list) {
        const form = new UI.ModalFormData();
        let types = ["textField", "toggle", "slider", "dropdown"];

        form.title("タイプ")
        .dropdown("タイプ", types, types.indexOf(settype))

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (settype !== types[formValues[0]]) {
            const form = new UI.ActionFormData();

            form.title("確認")
            .body("§cタイプを変更すると、今までの設定が破棄されますがよろしいですか？")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                delete newpopup[settype];
                switch (types[formValues[0]]) {
                    case "textField": {
                        newpopup["textField"] = {
                            title: "",
                            subtitle: "",
                            inputtext: ""
                        };
                        break;
                    };
                    case "toggle": {
                        newpopup["toggle"] = {
                            title: "",
                            state: false
                        };
                        break;
                    };
                    case "slider": {
                        newpopup["slider"] = {
                            title: "",
                            min: 0,
                            max: 1,
                            add: 1,
                            num: 0
                        };
                        break;
                    };
                    case "dropdown": {
                        newpopup["dropdown"] = {
                            title: "",
                            array: [],
                            num: 0
                        };
                        break;
                    };
                };
                return this.popup_create(player, json, newpopup, list);
            };
            if (selection === 1) return this.popup_create(player, json, newpopup, list);
        };
        this.popup_create(player, json, newpopup, list);
    };

    static async popup_create_edittype(player, json, newpopup, settype, list) {      
        switch (settype) {
            case "textField": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .textField("サブタイトル", "", newpopup[settype].subtitle)
                .textField("入力テキスト", "", newpopup[settype].inputtext)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].subtitle = formValues[1];
                newpopup[settype].inputtext = formValues[2];
                this.popup_create(player, json, newpopup, list);
                break;
            };
            case "toggle": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .toggle("初期状態", newpopup[settype].state)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].state = formValues[1];
                this.popup_create(player, json, newpopup, list);
                break;
            };
            case "slider": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .textField("最小値", "", `${newpopup[settype].min}`)
                .textField("最大値", "", `${newpopup[settype].max}`)
                .textField("加算値", "", `${newpopup[settype].add}`)
                .textField("初期値", "", `${newpopup[settype].num}`)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].min = formValues[1];
                newpopup[settype].max = formValues[2];
                newpopup[settype].add = formValues[3];
                newpopup[settype].num = formValues[4];
                this.popup_create(player, json, newpopup, list);
                break;
            };
            case "dropdown": {
                const form = new UI.ActionFormData();

                form.title(`${settype}を編集`)
                .button("§lタイトル")
                .button("§l要素")
                .button("§l初期値")
                .button("§l送信")

                const { selection, canceled } = await form.show(player);
                if (canceled) return;
                if (selection === 0) {
                    const form = new UI.ModalFormData();
                    
                    form.title("タイトル")
                    .textField("タイトル", "", newpopup[settype].title)

                    const { formValues, canceled } = await form.show(player);
                    if (canceled) return;
                    newpopup[settype].title = formValues[0];
                    this.popup_create_edittype(player, json, newpopup, settype, list);
                };
                if (selection === 1) {
                    array_add();
                    async function array_add() {
                        const form = new UI.ActionFormData();
                
                        form.title("要素")
                        .button("§l戻る")
                        .button("§l作成")

                        for (const element of newpopup[settype].array) {
                            form.button(element)
                        };

                        const { selection, canceled } = await form.show(player);
                        if (canceled) return;
                        if (selection === 0) return Forms_ModalForlData.popup_create_edittype(player, json, newpopup, settype, list);
                        if (selection === 1) {
                            const form = new UI.ModalFormData();

                            form.title("作成")
                            .textField("要素名", "", "")

                            const { formValues, canceled } = await form.show(player);
                            if (canceled) return;
                            if (formValues[0].trim() === "") return array_add();
                            newpopup[settype].array.push(formValues[0]);
                            array_add();
                            return;
                        };
                        selection: {
                            const form = new UI.ModalFormData();
                            
                            form.title("要素")
                            .textField("要素名", "", newpopup[settype].array[selection - 2])

                            const { formValues, canceled } = await form.show(player);
                            if (canceled) return;
                            if (formValues[0].trim() === "") {
                                newpopup[settype].array.splice(selection - 2, 1);
                                array_add();
                                return;
                            };
                            newpopup[settype].array[selection - 2] = formValues[0];
                            array_add();
                            return;
                        };
                    };
                };
                if (selection === 2) {
                    const form = new UI.ModalFormData();
                    
                    form.title("初期値")
                    .slider("初期値", 0, newpopup[settype].array.length - 1, 1, newpopup[settype].num)

                    const { formValues, canceled } = await form.show(player);
                    if (canceled) return;
                    newpopup[settype].num = formValues[0];
                    this.popup_create_edittype(player, json, newpopup, settype, list);
                };
                if (selection === 3) return this.popup_create(player, json, newpopup, list);
                break;
            };
        };
    };

    static async popup_select(player, json, newpopup, num, list) {
        if (!newpopup) newpopup = json.data.contents[num];
        let settype = "";
        const form = new UI.ActionFormData();
        for (const type in newpopup) {
            settype = type;
        };

        form.title("ポップアップ")
        .button("§l戻る")
        .button("§lタイプ")
        .button(`§l${settype}を編集`)
        .button("§l削除")
        .button("§l保存")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (canceled) return;
        if (selection === 0) {
            const form = new UI.ActionFormData();
            
            form.title("確認")
            .body("§c保存する前にフォームを戻ると、今までの設定が破棄されます")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) this.menu(player, json, newpopup, list);
            if (selection === 1) this.popup_select(player, json, newpopup, num, list);
            return;
        };
        if (selection === 1) return this.popup_select_type(player, json, newpopup, settype, num, list);
        if (selection === 2) return this.popup_select_edittype(player, json, newpopup, settype, num, list);
        if (selection === 3) {
            const form = new UI.ActionFormData();

            form.title("確認")
            .body("§c削除すると、元に戻すことはできません。それでも削除しますか？")
            .button("§lはい")
            .button("§lいいえ")
            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                delete json.data.contents[num];
                this.popup(player, json, list);
                return;
            };
            if (selection === 1) return this.popup_select(player, json, newpopup, num, list);
            return;
        };
        if (selection === 4) {
            json.data.contents[num] = newpopup;
            this.popup(player, json, list);
            return;
        };
    };

    static async popup_select_type(player, json, newpopup, settype, num, list) {
        const form = new UI.ModalFormData();
        let types = ["textField", "toggle", "slider", "dropdown"];

        form.title("タイプ")
        .dropdown("タイプ", types, types.indexOf(settype))

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (settype !== types[formValues[0]]) {
            const form = new UI.ActionFormData();

            form.title("確認")
            .body("§cタイプを変更すると、今までの設定が破棄されますがよろしいですか？")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                delete newpopup[settype];
                switch (types[formValues[0]]) {
                    case "textField": {
                        newpopup["textField"] = {
                            title: "",
                            subtitle: "",
                            inputtext: ""
                        };
                        break;
                    };
                    case "toggle": {
                        newpopup["toggle"] = {
                            title: "",
                            state: false
                        };
                        break;
                    };
                    case "slider": {
                        newpopup["slider"] = {
                            title: "",
                            min: 0,
                            max: 1,
                            add: 1,
                            num: 0
                        };
                        break;
                    };
                    case "dropdown": {
                        newpopup["dropdown"] = {
                            title: "",
                            array: [],
                            num: 0
                        };
                        break;
                    };
                };
                return this.popup_select(player, json, newpopup, num, list);
            };
            if (selection === 1) return this.popup_select(player, json, newpopup, num, list);
        };
        this.popup_select(player, json, newpopup, num, list);
    };

    static async popup_select_edittype(player, json, newpopup, settype, num, list) {        
        switch (settype) {
            case "textField": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .textField("サブタイトル", "", newpopup[settype].subtitle)
                .textField("入力テキスト", "", newpopup[settype].inputtext)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].subtitle = formValues[1];
                newpopup[settype].inputtext = formValues[2];
                this.popup_select(player, json, newpopup, num, list);
                break;
            };
            case "toggle": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .toggle("初期状態", newpopup[settype].state)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].state = formValues[1];
                this.popup_select(player, json, newpopup, num, list);
                break;
            };
            case "slider": {
                const form = new UI.ModalFormData();

                form.title(`${settype}を編集`)
                .textField("タイトル", "", newpopup[settype].title)
                .textField("最小値", "", `${newpopup[settype].min}`)
                .textField("最大値", "", `${newpopup[settype].max}`)
                .textField("加算値", "", `${newpopup[settype].add}`)
                .textField("初期値", "", `${newpopup[settype].num}`)

                const { formValues, canceled } = await form.show(player);
                if (canceled) return;
                newpopup[settype].title = formValues[0];
                newpopup[settype].min = formValues[1];
                newpopup[settype].max = formValues[2];
                newpopup[settype].add = formValues[3];
                newpopup[settype].num = formValues[4];
                this.popup_select(player, json, newpopup, num, list);
                break;
            };
            case "dropdown": {
                const form = new UI.ActionFormData();

                form.title(`${settype}を編集`)
                .button("§lタイトル")
                .button("§l要素")
                .button("§l初期値")
                .button("§l送信")

                const { selection, canceled } = await form.show(player);
                if (canceled) return;
                if (selection === 0) {
                    const form = new UI.ModalFormData();
                    
                    form.title("タイトル")
                    .textField("タイトル", "", newpopup[settype].title)

                    const { formValues, canceled } = await form.show(player);
                    if (canceled) return;
                    newpopup[settype].title = formValues[0];
                    this.popup_select_edittype(player, json, newpopup, settype, num, list);
                };
                if (selection === 1) {
                    array_add();
                    async function array_add() {
                        const form = new UI.ActionFormData();
                
                        form.title("要素")
                        .button("§l戻る")
                        .button("§l作成")

                        for (const element of newpopup[settype].array) {
                            form.button(element)
                        };

                        const { selection, canceled } = await form.show(player);
                        if (canceled) return;
                        if (selection === 0) return Forms_ModalForlData.popup_select_edittype(player, json, newpopup, settype, num, list);
                        if (selection === 1) {
                            const form = new UI.ModalFormData();

                            form.title("作成")
                            .textField("要素名", "", "")

                            const { formValues, canceled } = await form.show(player);
                            if (canceled) return;
                            if (formValues[0].trim() === "") return array_add();
                            newpopup[settype].array.push(formValues[0]);
                            array_add();
                            return;
                        };
                        selection: {
                            const form = new UI.ModalFormData();
                            
                            form.title("要素")
                            .textField("要素名", "", newpopup[settype].array[selection - 2])

                            const { formValues, canceled } = await form.show(player);
                            if (canceled) return;
                            if (formValues[0].trim() === "") {
                                newpopup[settype].array.splice(selection - 2, 1);
                                array_add();
                                return;
                            };
                            newpopup[settype].array[selection - 2] = formValues[0];
                            array_add();
                            return;
                        };
                    };
                };
                if (selection === 2) {
                    const form = new UI.ModalFormData();
                    
                    form.title("初期値")
                    .slider("初期値", 0, newpopup[settype].array.length - 1, 1, newpopup[settype].num)

                    const { formValues, canceled } = await form.show(player);
                    if (canceled) return;
                    newpopup[settype].num = formValues[0];
                    this.popup_select_edittype(player, json, newpopup, settype, num, list);
                };
                if (selection === 3) return this.popup_select(player, json, newpopup, num, list);
                break;
            };
        };
    };

    static async preview(player, json, list) {
        if (!(Object.keys(json.data.contents).length > 0)) return this.menu(player, json);
        const form = new UI.ModalFormData();

        form.title(json.data.title)

        for (const content in json.data.contents) {
            let settype = "";
            for (const type in json.data.contents[content]) {
                settype = type;
            };
            switch (settype) {
                case "textField": {
                    form.textField(json.data.contents[content][settype].title, json.data.contents[content][settype].subtitle, json.data.contents[content][settype].inputtext)
                    break;
                };
                case "toggle": {
                    form.toggle(json.data.contents[content][settype].title, json.data.contents[content][settype].state)
                    break;
                };
                case "slider": {
                    form.slider(json.data.contents[content][settype].title, json.data.contents[content][settype].min, json.data.contents[content][settype].max, json.data.contents[content][settype].add, json.data.contents[content][settype].num)
                    break;
                };
                case "dropdown": {
                    form.dropdown(json.data.contents[content][settype].title, json.data.contents[content][settype].array, json.data.contents[content][settype].num)
                    break;
                };
            };
        };

        const { formValues, canceled } = await form.show(player);
        this.menu(player, json, list);
    };
};

class Forms_MessageFormData {
    static async menu(player, json, list) {
        const formjson = json.data;
        const form = new UI.ActionFormData();
        let body = [
            `ページタイトル: §d${formjson.title}§f`,
            `ボディ: §a${formjson.body}§f`,
            `ボタン数: §b${Object.keys(formjson.contents).length}§f`
        ].join("\n");

        form.title(`${json.type}の編集`)
        .body(body)
        .button("§lタイトル")
        .button("§lボディ")
        .button("§lボタン")
        .button("§lプレビュー")
        .button("§l戻る")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.title(player, json, list);
        if (selection === 1) return this.body(player, json, list);
        if (selection === 2) return this.button(player, json, list);
        if (selection === 3) return this.preview(player, json, list);
        if (selection === 4) return new Forms(player).create_preset(true, json, list);
    };

    static async title(player, json, list) {
        const form = new UI.ModalFormData();

        form.title("タイトル")
        .textField("タイトル", "", json.data.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.title = formValues[0];
        this.menu(player, json, list);
    };

    static async body(player, json, list) {
        const form = new UI.ModalFormData();

        form.title("ボディ")
        .textField("ボディ\n(改行するには\\nを使用してください)", "", json.data.body)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.body = formValues[0] === "" ? " " : formValues[0];
        this.menu(player, json, list);
    };

    static async button(player, json, list) {
        const form = new UI.ActionFormData();

        form.title("ボタン")
        .body("MessageFormDataでは、ボタンは2つまでのみ設定可能です")
        .button("§l戻る")
        .button("§lボタン1")
        .button("§lボタン2")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.menu(player, json, list);
        this.edit_button(player, json, list, selection - 1);
    };

    static async edit_button(player, json, list, num) {
        const form = new UI.ActionFormData();
        let body = [
            `ボタンタイトル: §d${json.data.contents[num].title}§f`,
            `ボタンテクスチャ: §a${json.data.contents[num].texture}§f`
        ].join("\n");

        form.title(`ボタン${num}`)
        .body(body)
        .button("§l戻る")
        .button("§lタイトル")
        .button("§lテクスチャパス")
        .button("§lボタンプッシュイベント")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button(player, json, list);
        if (selection === 1) return this.button_title(player, json, list, num);
        if (selection === 2) return this.button_texture(player, json, list, num);
        if (selection === 3) return this.button_pushevent(player, json, list, num);
    };

    static async button_title(player, json, list, num) {
        const form = new UI.ModalFormData();

        form.title("ボタンタイトル")
        .textField("ボタンタイトル", "", json.data.contents[num].title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.contents[num].title = formValues[0];
        this.edit_button(player, json, list, num);
    };

    static async button_texture(player, json, list, num) {
        const form = new UI.ModalFormData();

        form.title("テクスチャパス")
        .textField("テクスチャパス", "", json.data.contents[num].texture)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.contents[num].texture = formValues[0];
        this.edit_button(player, json, list, num);
    };

    static async button_pushevent(player, json, list, num) {
        const form = new UI.ActionFormData();

        form.title("ボタンプッシュイベント")
        .button("§l戻る")
        .button("§lコマンド")
        .button("§l画面遷移")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.edit_button(player, json, list, num);
        if (selection === 1) return this.button_pushevent_commands(player, json, list, num);
        if (selection === 2) return this.button_pushevent_move(player, json, list, num);
    };

    static async button_pushevent_commands(player, json, list, num) {
        const form = new UI.ActionFormData();

        form.title("コマンド")
        .button("§l戻る")
        .button("§l追加")

        for (const command of json.data.contents[num].selection.runCommands) {
            form.button(command)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_pushevent(player, json, list, num);
        if (selection === 1) return this.button_pushevent_commands_add(player, json, list, num);
        this.button_pushevent_commands_select(player, json, list, num, selection - 2);
    };

    static async button_pushevent_commands_add(player, json, list, num) {
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド", "", "")

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") return this.button_pushevent_commands(player, json, list, num);
        json.data.contents[num].selection.runCommands.push(formValues[0].replace("/", ""));
        this.button_pushevent_commands(player, json, list, num);
    };

    static async button_pushevent_commands_select(player, json, list, num, snum) {
        const form = new UI.ModalFormData();

        form.title("コマンド")
        .textField("コマンド\n空白で削除", "", json.data.contents[num].selection.runCommands[snum])

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") {
            json.data.contents[num].selection.runCommands.splice(snum, 1);
            this.button_pushevent_commands(player, json, list, num);
            return;
        };
        json.data.contents[num].selection.runCommands[snum] = formValues[0].replace("/", "");
        this.button_pushevent_commands(player, json, list, num);
    };

    static async button_pushevent_move(player, json, list, num) {
        const form = new UI.ModalFormData();

        form.title("画面遷移")
        .textField("遷移先プリセット名", "", json.data.contents[num].selection.move)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        json.data.contents[num].selection.move = formValues[0];
        this.button_pushevent(player, json, list, num);
    };

    static async preview(player, json, list) {
        if (json.data.body === "") return this.menu(player, json, list);
        const form = new UI.MessageFormData();

        form.title(json.data.title)
        .body(json.data.body.replace(/\\n/g, "\n"))

        for (const num in json.data.contents) {
            if (json.data.contents[num].texture !== "") {
                if (num == 0) form.button2(json.data.contents[num].title, json.data.contents[num].texture)
                if (num == 1) form.button1(json.data.contents[num].title, json.data.contents[num].texture)
            } else {
                if (num == 0) form.button2(json.data.contents[num].title)
                if (num == 1) form.button1(json.data.contents[num].title)
            };
        };

        const { selection, canceled } = await form.show(player);
        this.menu(player, json, list);
    };
};

class Forms_ChestFormData {
    static async menu(player, json, list) {
        const formjson = json.data;
        if (Object.keys(formjson.contents).length === 0) {
            switch (formjson.chesttype) {
                case "large": {
                    for (let i = 0; i < 54; i++) {
                        formjson.contents[i] = {
                            itemname: "",
                            itemdesc: [],
                            texture: "",
                            amount: 0,
                            selection: {
                                runCommands: [],
                                move: ""
                            }
                        };
                    };
                    break;
                };
                case "small": {
                    for (let i = 0; i < 27; i++) {
                        formjson.contents[i] = {
                            itemname: "",
                            itemdesc: [],
                            texture: "",
                            amount: 0,
                            selection: {
                                runCommands: [],
                                move: ""
                            }
                        };
                    };
                    break;
                };
            };
        };
        const form = new UI.ActionFormData();
        let body = [
            `チェストタイトル: §d${formjson.title}§f`,
            `チェストタイプ: ${formjson.chesttype}`,
            `アイテム数: §b${Object.keys(formjson.contents).length}§f`
        ].join("\n");

        form.title(`${json.type}の編集`)
        .body(body)
        .button("§lタイトル")
        .button("§lチェストタイプ")
        .button("§lボタン")
        .button("§l戻る")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.title(player, json, list);
        if (selection === 1) return this.chesttype(player, json, list);
        if (selection === 2) return this.button(player, json, list);
        if (selection === 3) return new Forms(player).create_preset(true, json, list);
    };

    static async title(player, json, list) {
        const formjson = json.data;
        const form = new UI.ModalFormData();

        form.title("タイトル")
        .textField("タイトル", "", formjson.title)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        formjson.title = formValues[0];
        this.menu(player, json, list);
    };

    static async chesttype(player, json, list) {
        const formjson = json.data;
        const form = new UI.ModalFormData();
        let types = ["small", "large"];

        form.title("チェストタイプ")
        .dropdown("チェストタイプ", types, types.indexOf(formjson.chesttype))

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;   
        if (formjson.chesttype === types[formValues[0]]) return this.menu(player, json, list);
        check: {
            const form = new UI.ActionFormData();
            let body = [
                "§cチェストタイプを変更すると、今までの変更が初期化されますがよろしいですか？"
            ].join("\n");

            form.title("確認")
            .body(body)
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                formjson.chesttype = types[formValues[0]];
                switch (formjson.chesttype) {
                    case "large": {
                        formjson.contents = {};
                        for (let i = 0; i < 54; i++) {
                            formjson.contents[i] = {
                                itemname: "",
                                itemdesc: [],
                                texture: "",
                                amount: 0,
                                selection: {
                                    runCommands: [],
                                    move: ""
                                }
                            };
                        };
                        break;
                    };
                    case "small": {
                        formjson.contents = {};
                        for (let i = 0; i < 27; i++) {
                            formjson.contents[i] = {
                                itemname: "",
                                itemdesc: [],
                                texture: "",
                                amount: 0,
                                selection: {
                                    runCommands: [],
                                    move: ""
                                }
                            };
                        };
                        break;
                    };
                };
                this.menu(player, json, list);
            };
            if (selection === 1) return this.menu(player, json, list);
        };
    };

    static async button(player, json, list) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new ChestFormData(formjson.chesttype);
        form.title("ボタン編集")
        
        switch (formjson.chesttype) {
            case "large": {
                for (let i = 0; i < 54; i++) {
                    form.button(i, contents[i].itemname, contents[i].itemdesc, contents[i].texture, contents[i].amount);
                };
                break;
            };
            case "small": {
                for (let i = 0; i < 27; i++) {
                    form.button(i, contents[i].itemname, contents[i].itemdesc, contents[i].texture, contents[i].amount);
                };
                break;
            };
        };

        const { selection, canceled } = await form.show(player); 
        if (canceled) return this.menu(player, json, list);
        //this.button_select(player, json, list, selection);
        this.button_select(player, json, list, selection);
    };

    static async button_select(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ActionFormData();
        let body = [
            `アイテム名: ${contents[i].itemname}`,
            `アイテム説明: ${contents[i].itemdesc}`,
            `アイテムテクスチャ: ${contents[i].texture}`,
            `アイテム数: ${contents[i].amount}`,
        ].join("\n");

        form.title("ボタンの編集")
        .body(body)
        .button("§l戻る")
        .button("§lアイテム編集")
        .button("§lボタンプッシュイベント")
        .button("§l全てリセット")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button(player, json, list);
        if (selection === 1) return this.button_select_edit(player, json, list, i);
        if (selection === 2) return this.button_select_pushevent(player, json, list, i);
        if (selection === 3) {
            const form = new UI.ActionFormData();

            form.title("確認")
            .body("§c今までのボタン設定がリセットされますがよろしいですか？\n元に戻すことはできません")
            .button("§lはい")
            .button("§lいいえ")

            const { selection, canceled } = await form.show(player);
            if (canceled) return;
            if (selection === 0) {
                contents[i].itemname = "";
                contents[i].itemdesc = [];
                contents[i].texture = "";
                contents[i].amount = 0;
                contents[i].selection = {
                    runCommands: [],
                    move: ""
                };
                this.button(player, json, list);
                return;
            };
            if (selection === 1) return this.button_select(player, json, list, i);
        };
    };

    static async button_select_edit(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ModalFormData();

        form.title("ボタンの編集")
        .textField("アイテム名", "", `${contents[i].itemname}`)
        .textField("アイテム説明", "", `${contents[i].itemdesc}`)
        .textField("アイテムテクスチャ", "", `${contents[i].texture}`)
        .textField("アイテム数", "", `${contents[i].amount}`)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        contents[i].itemname = formValues[0];
        contents[i].itemdesc = formValues[1].split(",");
        contents[i].texture = formValues[2];
        contents[i].amount = !parseInt(formValues[3]) ? 0 : parseInt(formValues[3]);
        this.button_select(player, json, list, i);
    };

    static async button_select_pushevent(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ActionFormData();

        form.title("ボタンプッシュイベント")
        .button("§l戻る")
        .button("§lコマンド")
        .button("§l画面遷移")

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_select(player, json, list, i);
        if (selection === 1) return this.button_select_pushevent_commands(player, json, list, i);
        if (selection === 2) return this.button_select_pushevent_move(player, json, list, i);
    };

    static async button_select_pushevent_commands(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ActionFormData();

        form.title("コマンド")
        .button("§l戻る")
        .button("§l追加")

        for (const command of contents[i].selection.runCommands) {
            form.button(command)
        };

        const { selection, canceled } = await form.show(player);
        if (canceled) return;
        if (selection === 0) return this.button_select_pushevent(player, json, list, i);
        if (selection === 1) return this.button_select_pushevent_commands_add(player, json, list, i);
        this.button_select_pushevent_commands_select(player, json, list, i, selection - 2);
    };

    static async button_select_pushevent_commands_add(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド", "", "")

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") return this.button_select_pushevent_commands(player, json, list, i);
        contents[i].selection.runCommands.push(formValues[0].replace("/", ""));
        this.button_select_pushevent_commands(player, json, list, i);
    };

    static async button_select_pushevent_commands_select(player, json, list, i, num) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ModalFormData();

        form.title("コマンド追加")
        .textField("コマンド\n空白で削除", "", contents[i].selection.runCommands[num])

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        if (formValues[0].trim() === "") {
            contents[i].selection.runCommands.splice(num, 1);
            this.button_select_pushevent_commands(player, json, list, i);
            return;
        };
        contents[i].selection.runCommands[num] = formValues[0].replace("/", "");
        this.button_select_pushevent_commands(player, json, list, i);
    };

    static async button_select_pushevent_move(player, json, list, i) {
        const formjson = json.data;
        const contents = formjson.contents;
        const form = new UI.ModalFormData();

        form.title("画面遷移")
        .textField("遷移先プリセット名", "", contents[i].selection.move)

        const { formValues, canceled } = await form.show(player);
        if (canceled) return;
        contents[i].selection.move = formValues[0];
        this.button_select_pushevent(player, json, list, i);
    };
};