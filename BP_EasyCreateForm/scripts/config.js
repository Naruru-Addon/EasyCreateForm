export const config = {
    reference_setting: {
        events: {
            Chat: {
                cancel: false,
                tag: [],
                message: ""
            },
            ItemUse: {
                cancel: false,
                tag: [],
                itemStack: {
                    id: "",
                    name: ""
                }
            },
            EntityUse: {
                cancel: false,
                tag: [],
                target: {
                    id: "",
                    name: ""
                }
            },
            BlockUse: {
                cancel: false,
                tag: [],
                block: {
                    id: "",
                    itemStack: {
                        id: "",
                        name: ""
                    }
                }
            },
            BlockPlace: {
                cancel: false,
                tag: [],
                block: {
                    id: ""
                }
            },
            BlockBreak: {
                cancel: false,
                tag: [],
                block: {
                    id: "",
                    itemStack: {
                        id: "",
                        name: ""
                    }
                }
            }
        },
        types: {
            ActionFormData: {
                title: "", // ページタイトル
                body: "", // ボディに表示するテキスト
                contents: {
                    /*
                    0: {
                        title: "", // タイトルテキスト
                        texture: "", // 表示するテクスチャパス
                        selection: {
                            runCommands: [], // 実行コマンド
                            move: "" // 画面切り替えパス (セット名)
                        }
                    },
                    */
                }
            },
            ModalFormData: {
                title: "", // ページタイトル
                contents: {
                    /*
                    0: {
                        textField: {
                            title: "", // タイトルテキスト
                            subtitle: "", // サブタイトルテキスト
                            inputtext: "", // 入力テキスト
                        }
                    }
                    },
                    1: {
                        toggle: {
                            title: "", // タイトルテキスト
                            state: false, // 初期状態
                        }
                    },
                    2: {
                        dropDown: {
                            title: "", //タイトルテキスト
                            array: [], // 選択することができる値
                            num: 0, // 初期値
                        }
                    },
                    3: {
                        slider: {
                            title: "",
                            min: 0,
                            max: 1,
                            add: 1,
                            num: 0
                        }
                    }
                    */
                },
                formValues: {
                    //(コマンド内で<value[num]>とすることでそこに入力された値を代入)
                    // dropDownは数字で返ってくるため、Number()で比較してarrayから取り出す
                    runCommands: [], // 実行コマンド
                    move: "", // 画面切り替えパス (セット名)
                }
            },
            MessageFormData: {
                title: "", // ページタイトル
                body: " ", // ボディに表示するテキスト
                contents: {
                    0: {
                        title: "", // タイトルテキスト
                        texture: "", // 表示するテクスチャパス
                        selection: {
                            runCommands: [], // 実行コマンド
                            move: "", // 画面切り替えパス (セット名)
                        }
                    },
                    1: {
                        title: "", // タイトルテキスト
                        texture: "", // 表示するテクスチャパス
                        selection: {
                            runCommands: [], // 実行コマンド
                            move: "", // 画面切り替えパス (セット名)
                        }
                    }
                }
            },
            ChestFormData: {
                title: "", // タイトル
                chesttype: "small",
                contents: {
                    //.button(11, "§lウール", [`§r§b値段 §f: §e5鉄`,`§r§b所持数 §f: §g${nowamount(player,`minecraft:${until.pcolor(player)}_wool`)}`,"","アイテムをクリック"], `textures/shop_blocks/wool_${until.pcolor(player)}`, 32)
                    /*
                    0: {
                        itemname: "", // アイテム名
                        itemdesc: [], // アイテムのルール
                        texture: "", // 表示するテクスチャパス
                        amount: 0,
                        selection: {
                            runCommands: [], // 実行コマンド
                            move: "" // 画面切り替えパス (セット名)
                        }
                    }
                    */
                },
            }
        }
    },

    default_setting: {
        presetname: "",
        event: {
            evname: "Chat",
            ev: {
                cancel: false,
                message: ""
            }
        },
        type: "ActionFormData",
        data: {}
    },
};