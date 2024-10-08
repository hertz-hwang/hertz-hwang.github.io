<script lang="ts">
    import { Action, ActionNames, ActionType, KeyboardNames, KeyboardType, ShortCmd } from "./model/keyboardLayout";
    import Icon from "@iconify/svelte";

    /** 绑定的按键动作对象 */
    export var action: Action;
    export var clipAction: Action;

    /** 动作类型列表 */
    var actionTypes = Object.values(ActionType);
    var keyboardTypes = Object.values(KeyboardType);
    var shortCmdTypes = Object.values(ShortCmd);
    $: funcKeys = [
        ActionType.backspace,
        ActionType.enter,
        ActionType.shift,
        ActionType.tab,
        ActionType.space,
        ActionType.nextKeyboard,
        ActionType.none,
    ].includes(action.type);

    // 包含内容文本的动作类型
    const text: ActionType[] = [ActionType.character, ActionType.characterMargin, ActionType.symbol];
    const cmdTypeInfos: Record<string, string> = {
        [ShortCmd.clear]: "清空预编辑串, 即尚未上屏的文本",
        [ShortCmd.trad]: "请先在 Rime 配置页面填写切换键值",
        [ShortCmd.return]: "向输入框发送换行, 不经由 Rime 处理",
        [ShortCmd.switcher]: "Rime 方案选项",
        [ShortCmd.left]: "输入框光标左移",
        [ShortCmd.right]: "输入框光标右移",
        [ShortCmd.selectText]: "全选",
        [ShortCmd.deleteText]: "清空输入框",
        [ShortCmd.sendkeys]: "向 Rime 发送连续按键或組合键",
        [ShortCmd.enter]: "直接向文本框发送回车指令",
        [ShortCmd.showPhrase]: "打开短语视图",
        [ShortCmd.showPasteboard]: "打开粘贴板视图",
        [ShortCmd.showScript]: "显示脚本视图",
        [ShortCmd.hideScript]: "关闭脚本视图",
        [ShortCmd.toggleScript]: "开启或关闭脚本视图",
        [ShortCmd.openUrl]: "打开指定 URL, 或打开剪贴板 URL",
    };
    const cmdTypeWarnings: Record<string, string> = {
        [ShortCmd.selectAll]: "指令已移除, 请使用 selectText",
        [ShortCmd.clearAll]: "指令已移除, 请使用 deleteText",
        [ShortCmd.selectText]: "此指令存在诸多问题, 是 iOS 系统限制, 请勿反馈",
        [ShortCmd.deleteText]: "此指令存在诸多问题, 是 iOS 系统限制, 请勿反馈",
        [ShortCmd.showScript]: "指令已移除, 请使用 toggleScript",
        [ShortCmd.hideScript]: "指令已移除, 请使用 toggleScript",
    };

    function copyAction(): void {
        clipAction = action.clone();
    }
    function pasteAction(): void {
        action = clipAction.clone();
    }
</script>

<div class="flex flex-col w-full items-center">
    <div class="flex w-full items-center">
        <!-- 单选: 动作类型 -->
        <select
            bind:value={action.type}
            class="appearance-none w-full h-10 px-2 variant-ringed hover:variant-ghost"
            class:rounded-bl-md={funcKeys}
        >
            {#each actionTypes as typ}
                <option value={typ}>
                    {ActionNames[typ] ? ActionNames[typ] : typ} ({typ})
                </option>
            {/each}
        </select>
        <button
            title="复制动作配置"
            on:click={copyAction}
            class="h-10 px-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
        >
            <Icon height="20" icon="mdi:content-copy" />
        </button>
        <button
            title="粘贴动作配置"
            on:click={pasteAction}
            class="h-10 px-2 flex items-center variant-ringed hover:variant-ghost active:scale-95"
            class:rounded-br-md={funcKeys}
        >
            <Icon height="20" icon="mdi:content-paste" />
        </button>
    </div>

    <!-- 输入: 动作内容文本 -->
    {#if text.includes(action.type)}
        <div class="flex w-full h-10 items-center">
            <input
                bind:value={action.text}
                class="w-full h-full px-2 grow rounded-none rounded-b-md variant-ringed hover:variant-ghost"
                placeholder="按键字符内容"
            />
        </div>
    {/if}

    <!-- 单选: 切换键盘类型 -->
    {#if action.type === ActionType.keyboardType}
        <div class="flex w-full h-10 items-center">
            <select
                bind:value={action.kbd}
                class="appearance-none grow h-full px-2 variant-ringed hover:variant-ghost"
                class:rounded-b-md={action.kbd !== KeyboardType.custom}
            >
                {#each keyboardTypes as typ}
                    <option value={typ}>
                        {KeyboardNames[typ] ? KeyboardNames[typ] : typ} ({typ})
                    </option>
                {/each}
            </select>
        </div>
    {/if}

    <!-- 输入: 自定义键盘名称 -->
    {#if action.type === ActionType.keyboardType && action.kbd === KeyboardType.custom}
        <div class="flex w-full h-10 items-center">
            <input
                bind:value={action.text}
                class="grow h-full px-2 rounded-none rounded-b-md variant-ringed hover:variant-ghost"
                placeholder="自定义键盘名"
            />
        </div>
    {/if}

    <!-- 提示: 快捷命令简介 -->
    {#if action.type === ActionType.shortCommand && cmdTypeInfos[action.cmd]}
        <div class="flex h-8 items-center text-sm gap-1">
            <Icon icon="mdi:information-box" />
            {cmdTypeInfos[action.cmd]}
        </div>
        <hr class="w-64 !border-t-2" />
    {/if}

    <!-- 提示: 快捷命令警告 -->
    {#if action.type === ActionType.shortCommand && cmdTypeWarnings[action.cmd]}
        <div class="flex h-8 items-center text-warning-500 text-sm gap-1">
            <Icon icon="mdi:warning-box" />
            {cmdTypeWarnings[action.cmd]}
        </div>
    {/if}

    <!-- 单选: 快捷命令类型 -->
    {#if action.type === ActionType.shortCommand}
        <div class="flex w-full h-10 items-center">
            <select
                bind:value={action.cmd}
                class="appearance-none grow h-full px-2 variant-ringed hover:variant-ghost"
                class:rounded-b-md={action.cmd !== ShortCmd.sendkeys && action.cmd !== ShortCmd.openUrl}
            >
                {#each shortCmdTypes as typ}
                    <option value={typ}>
                        {typ}
                    </option>
                {/each}
            </select>
        </div>
    {/if}

    <!-- 输入: 快捷命令·快捷键 -->
    {#if action.type === ActionType.shortCommand && action.cmd === ShortCmd.sendkeys}
        <div class="flex w-full h-10 items-center">
            <input
                bind:value={action.text}
                class="grow h-full px-2 rounded-none rounded-b-md variant-ringed hover:variant-ghost"
                placeholder="nihao | Control_L+a"
            />
        </div>
    {/if}

    <!-- 输入: 快捷命令·打开 URL -->
    {#if action.type === ActionType.shortCommand && action.cmd === ShortCmd.openUrl}
        <div class="flex w-full h-10 items-center">
            <input
                bind:value={action.text}
                class="grow h-full px-2 rounded-none rounded-b-md variant-ringed hover:variant-ghost"
                placeholder="#pasteboardContent | weixin://xxx"
            />
        </div>
    {/if}
</div>
