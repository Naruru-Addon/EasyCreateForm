# EasyCreateForm addon

![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/Naruru-Addon/EasyCreateForm/total) ![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/Naruru-Addon/EasyCreateForm/latest/total?color=green) ![GitHub Release](https://img.shields.io/github/v/release/Naruru-Addon/EasyCreateForm)
 
簡単にフォームを作成することができます

アドオンのダウンロードは[コチラ](https://github.com/Naruru-Addon/EasyCreateForm/releases)

クラフターズコロニーは[コチラ](https://minecraft-mcworld.com/39215/)

# 質問
[ディスコードサーバー](https://discord.com/invite/hAEJXUJY9q)で受け付けています

# 使い方
まずはアドオンをワールドにインポートしてください。

__インポートができたら、``ベータAPI``と``ホリデークリエイターの特徴``をワールド設定からオンにしてください__

ワールドにアドオンを入れて、``/tag @s add op``で権限タグをつけます

※opを持っていれば使用はできますが、Realms等ではopタグを付けないと機能しない場合があります

チャット欄で、「/」を付けずにcreate formと入力し実行します

そうすると、フォームを作成するためのプリセットフォームが出てくるので、そこで諸々設定をします

あとは自分の好きなようにカスタマイズしてください

カスタマイズができたら作成ボタンを押して作成します

※呼び出しイベントを設定しないと作成したフォームを呼び出すことはできません

※bodyや、アイテム説明などで改行するには、「,」を使用してください

※イベントでのIDなどは「minecraft:」のような識別IDも入力してください

※ModalFormDataのコマンドで、<formValues0>のようにすることで、コマンドに値を埋め込めます

例: /give @s stone <formValues0>

# テクスチャ指定について
https://github.com/KygekDev/default-textures

こちらのテクスチャパスを参照してください。

textures/〇〇/〇〇..のように指定します

# コマンド一覧
| コマンド  | 説明 |
| ------------- | ------------- |
| create form  | フォーム作成用フォームを表示します |
| form list  | 作成されたフォームのリストを表示します |

# 使用ライブラリ

https://github.com/Herobrine643928/Chest-UI
