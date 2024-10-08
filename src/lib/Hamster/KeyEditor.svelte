<script lang="ts">
    import { Action, Key, Keyboard } from "./model/keyboardLayout";
    import KeyEdit from "./KeyEdit.svelte";

    export var landscape: boolean = false;
    export var layout: Keyboard;
    export var selected: { row: number; col: number };
    export var keyStyleNames: string[];

    var clipKey: Key;
    var clipAction: Action;
    var selectedKey: Key = new Key();
    $: if (selectedValid(selected, layout)) selectedKey = layout.rows[selected.row].keys[selected.col] || new Key();

    /** 判定当前坐标是否有效 */
    function selectedValid(selected: { row: number; col: number }, layout: Keyboard): boolean {
        return selected.row < layout.rows.length && selected.col < layout.rows[selected.row].keys.length;
    }
    /** 繼续编辑下一個按键 */
    function selectNextKey() {
        // 统計總数
        var count = 0;
        layout.rows.forEach((row) => {
            row.keys.forEach((_) => count++);
        });
        // 總数爲零, 直接返回
        if (!count) {
            [selected.row, selected.col] = [0, 0];
            return;
        }
        // 遍歷查找下一個按键
        var { row, col } = selected;
        col++;
        while (!selectedValid({ row, col }, layout)) {
            if (row >= layout.rows.length) {
                [row, col] = [0, 0];
            } else if (col >= layout.rows[row].keys.length) {
                row++;
                col = 0;
            } else {
                col++;
            }
        }
        [selected.row, selected.col] = [row, col];
    }

    /** 删除按键 */
    function delButton(): void {
        if (selectedValid(selected, layout)) {
            layout.rows[selected.row].keys.splice(selected.col, 1);
            layout.rows[selected.row].keys = layout.rows[selected.row].keys;
        }
    }
    /** 左移按键 */
    function moveBtnLeft(): void {
        if (selected.col > 0 && selectedValid(selected, layout)) {
            var [i, j] = [selected.row, selected.col];
            [layout.rows[i].keys[j], layout.rows[i].keys[j - 1]] = [layout.rows[i].keys[j - 1], layout.rows[i].keys[j]];
            selected.col--;
        }
    }
    /** 右移按键 */
    function moveBtnRight(): void {
        if (selectedValid(selected, layout) && selected.col < layout.rows[selected.row].keys.length - 1) {
            var [i, j] = [selected.row, selected.col];
            [layout.rows[i].keys[j], layout.rows[i].keys[j + 1]] = [layout.rows[i].keys[j + 1], layout.rows[i].keys[j]];
            selected.col++;
        }
    }
    /** 复制按键配置 */
    function copyKey(): void {
        if (selectedValid(selected, layout)) {
            var [i, j] = [selected.row, selected.col];
            clipKey = layout.rows[i].keys[j].clone();
        }
    }
    /** 粘贴按键配置 */
    function pasteKey(): void {
        if (selectedValid(selected, layout)) {
            var [i, j] = [selected.row, selected.col];
            layout.rows[i].keys[j] = clipKey.clone();
        }
    }
</script>

<!-- 按键编辑器 -->
<div class="w-full rounded-md variant-soft">
    <KeyEdit
        bind:key={selectedKey}
        bind:clipAction
        {landscape}
        {keyStyleNames}
        on:selectnext={selectNextKey}
        on:delkey={delButton}
        on:moveleft={moveBtnLeft}
        on:moveright={moveBtnRight}
        on:copykey={copyKey}
        on:pastekey={pasteKey}
    />
</div>
