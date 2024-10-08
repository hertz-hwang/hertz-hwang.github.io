var id: number = Date.now();

function newId(): number {
    id++;
    return id;
}

function asString(obj: any, defaultValue?: string): string {
    if (typeof obj === "number") {
        // 数字轉字符串: 0xabcdef => "0xabcdef"
        obj = "0x" + obj.toString(16).padStart(8, "0");
    }
    return typeof obj === "string" ? obj : defaultValue || "";
}

function asNumber(obj: any, defaultValue?: number): number {
    return typeof obj === "number" ? obj : defaultValue || 0;
}

export class Color {
    color: string;
    alpha: number;

    constructor(color?: string, alpha?: number) {
        this.color = color || "";
        this.alpha = typeof alpha === "number" && alpha >= 0 && alpha <= 0xff ? alpha : 0xff;
    }

    rgba(): string {
        if (!this.color) {
            return "";
        }
        var r = parseInt(this.color.slice(1, 3), 16);
        var g = parseInt(this.color.slice(3, 5), 16);
        var b = parseInt(this.color.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${this.alpha / 256})`;
    }

    abgr(): string {
        if (!this.color) {
            return "";
        }
        var r = this.color.slice(1, 3);
        var g = this.color.slice(3, 5);
        var b = this.color.slice(5, 7);
        var a = this.alpha === 0xff ? "" : (this.alpha || 1).toString(16);
        if (a.length === 1) {
            a = "0" + a;
        }
        return "0x" + `${a}${b}${g}${r}`.toUpperCase();
    }

    clone(): Color {
        var color = new Color();
        color.color = this.color;
        color.alpha = this.alpha;
        return color;
    }

    fromAbgr(abgr: string): void {
        if (!abgr) {
            this.color = "";
            return;
        }
        const matcher = /^0x([0-9a-fA-F]{2})?([0-9a-fA-F]{6})$/;
        var res = matcher.exec(abgr);
        this.alpha = parseInt((res && res[1]) || "FF", 16);
        var bgr = (res && res[2]) || "000000";
        this.color = "#" + bgr.slice(4, 6) + bgr.slice(2, 4) + bgr.slice(0, 2);
    }
}

/** 配色方案結構定义 */
export class ColorSchema {
    id: number = newId();
    /** 配置方案唯一名称代碼 */
    schemaName: string = "schema";
    /** 显示名 */
    name: string = "配色方案";
    /** 作者 */
    author: string = "佚名";
    /** 键盘背景 */
    back_color: Color = new Color("#ffffff");
    /** 按键背景 */
    button_back_color: Color = new Color("#ffffff");
    /** 按键按下背景 */
    button_pressed_back_color: Color = new Color("#d0d0d0");
    /** 按键气泡背景 */
    button_bubble_back_color: Color = new Color("#d0d0d0");
    /** 按键文本 */
    button_front_color: Color = new Color("#000000");
    /** 按键按下文本 */
    button_pressed_front_color: Color = new Color("#000000");
    /** 按键划动文本 */
    button_swipe_front_color: Color = new Color("#000000");
    /** 按键按下划动文本 */
    button_swipe_pressed_front_color: Color = new Color("#000000");
    /** 键面字体大小 */
    font_size: number = 0;
    /** 划动字体大小 */
    swipe_font_size: number = 0;
    /** 按键圆角 */
    corner_radius: number = 5;
    /** 按键边框 */
    border_color: Color = new Color("#000000");
    /** 边框宽度 */
    border_size: number = 1;
    /** 预编辑文本 */
    text_color: Color = new Color("#000000");
    /** 按键下边框 */
    lower_edge_color: Color = new Color("#000000");
    /** 按键阴影 */
    shadow_color: Color = new Color("#000000");
    /** 按键阴影大小 */
    shadow_size: number = 0;
    /** 首选背景 */
    hilited_candidate_back_color: Color = new Color("#ffffff");
    /** 首选文本 */
    hilited_candidate_text_color: Color = new Color("#000000");
    /** 首选注释文本 */
    hilited_comment_text_color: Color = new Color("#000000");
    /** 候选欄首选序号 */
    hilited_candidate_label_color: Color = new Color("#000000");
    /** 候选文本 */
    candidate_text_color: Color = new Color("#000000");
    /** 注释文本 */
    comment_text_color: Color = new Color("#000000");
    /** 候选欄次选序号 */
    label_color: Color = new Color("#000000");
    /** 长按首选背景 */
    hilited_callout_back_color: Color = new Color("#ffffff");
    /** 长按首选文本 */
    hilited_callout_foreground_color: Color = new Color("#000000");
    /** 长按气泡背景 */
    action_callout_back_color: Color = new Color("#d0d0d0");

    toObject(): object {
        var obj: any = {
            schemaName: this.schemaName,
            name: this.name,
            author: this.author,
            back_color: this.back_color.abgr(),
            button_back_color: this.button_back_color.abgr(),
            button_pressed_back_color: this.button_pressed_back_color.abgr(),
            button_bubble_back_color: this.button_bubble_back_color.abgr(),
            button_foreground_color: this.button_front_color.abgr(),
            button_pressed_foreground_color: this.button_pressed_front_color.abgr(),
            button_swipe_foreground_color: this.button_swipe_front_color.abgr(),
            button_swipe_pressed_foreground_color: this.button_swipe_pressed_front_color.abgr(),
            font_size: this.font_size || undefined,
            swipe_font_size: this.swipe_font_size || undefined,
            corner_radius: this.corner_radius,
            border_color: this.border_color.abgr(),
            border_size: this.border_size,
            text_color: this.text_color.abgr(),
            lower_edge_color: this.lower_edge_color.abgr(),
            shadow_color: this.shadow_color.abgr(),
            shadow_size: this.shadow_size,
            hilited_candidate_back_color: this.hilited_candidate_back_color.abgr(),
            hilited_candidate_text_color: this.hilited_candidate_text_color.abgr(),
            hilited_candidate_label_color: this.hilited_candidate_label_color.abgr(),
            hilited_comment_text_color: this.hilited_comment_text_color.abgr(),
            candidate_text_color: this.candidate_text_color.abgr(),
            comment_text_color: this.comment_text_color.abgr(),
            label_color: this.label_color.abgr(),
            hilited_callout_back_color: this.hilited_callout_back_color.abgr(),
            hilited_callout_foreground_color: this.hilited_callout_foreground_color.abgr(),
            action_callout_back_color: this.action_callout_back_color.abgr(),
        };
        return obj;
    }

    fromObject(obj: any): void {
        if (obj && typeof obj === "object") {
            this.schemaName = asString(obj.schemaName, "schema");
            this.name = asString(obj.name, "配色方案");
            this.author = asString(obj.author, "佚名");
            this.back_color.fromAbgr(asString(obj.back_color, "0xffffff"));
            this.button_back_color.fromAbgr(asString(obj.button_back_color, "0xffffff"));
            this.button_pressed_back_color.fromAbgr(asString(obj.button_pressed_back_color, "0xD0D0D0"));
            this.button_bubble_back_color.fromAbgr(asString(obj.button_bubble_back_color, "0xD0D0D0"));
            if (
                obj.button_foreground_color ||
                obj.button_pressed_foreground_color ||
                obj.button_swipe_foreground_color
            ) {
                this.button_front_color.fromAbgr(asString(obj.button_foreground_color, "0x000000"));
                this.button_pressed_front_color.fromAbgr(asString(obj.button_pressed_foreground_color, "0x000000"));
                this.button_swipe_front_color.fromAbgr(asString(obj.button_swipe_foreground_color, "0x000000"));
                this.button_swipe_pressed_front_color.fromAbgr(
                    asString(obj.button_swipe_pressed_foreground_color, "0x000000"),
                );
            } else {
                this.button_front_color.fromAbgr(asString(obj.button_front_color, "0x000000"));
                this.button_pressed_front_color.fromAbgr(asString(obj.button_pressed_front_color, "0x000000"));
                this.button_swipe_front_color.fromAbgr(asString(obj.button_swipe_front_color, "0x000000"));
                this.button_swipe_pressed_front_color.fromAbgr(
                    asString(obj.button_swipe_pressed_front_color, "0x000000"),
                );
            }
            this.font_size = asNumber(obj.font_size);
            this.swipe_font_size = asNumber(obj.swipe_font_size);
            this.corner_radius = asNumber(obj.corner_radius, 5);
            this.border_color.fromAbgr(asString(obj.border_color, "0x000000"));
            this.border_size = asNumber(obj.border_size, 1);
            this.text_color.fromAbgr(asString(obj.text_color, "0x000000"));
            this.lower_edge_color.fromAbgr(asString(obj.lower_edge_color, "0x000000"));
            this.shadow_color.fromAbgr(asString(obj.shadow_color, "0x000000"));
            this.shadow_size = asNumber(obj.shadow_size);
            this.hilited_candidate_back_color.fromAbgr(asString(obj.hilited_candidate_back_color, "0xffffff"));
            this.hilited_candidate_text_color.fromAbgr(asString(obj.hilited_candidate_text_color, "0x000000"));
            this.hilited_candidate_label_color.fromAbgr(asString(obj.hilited_candidate_label_color, "0x000000"));
            this.hilited_comment_text_color.fromAbgr(asString(obj.hilited_comment_text_color, "0x000000"));
            this.candidate_text_color.fromAbgr(asString(obj.candidate_text_color, "0x000000"));
            this.comment_text_color.fromAbgr(asString(obj.comment_text_color, "0x000000"));
            this.label_color.fromAbgr(asString(obj.label_color, "0x000000"));
            this.hilited_callout_back_color.fromAbgr(asString(obj.hilited_callout_back_color, "0xffffff"));
            this.hilited_callout_foreground_color.fromAbgr(asString(obj.hilited_callout_foreground_color, "0x000000"));
            this.action_callout_back_color.fromAbgr(asString(obj.action_callout_back_color, "0xd0d0d0"));
        }
    }

    clone(): ColorSchema {
        var schema = new ColorSchema();
        schema.schemaName = this.schemaName;
        schema.name = this.name;
        schema.author = this.author;
        schema.back_color = this.back_color.clone();
        schema.button_back_color = this.button_back_color.clone();
        schema.button_pressed_back_color = this.button_pressed_back_color.clone();
        schema.button_bubble_back_color = this.button_bubble_back_color.clone();
        schema.button_front_color = this.button_front_color.clone();
        schema.button_pressed_front_color = this.button_pressed_front_color.clone();
        schema.button_swipe_front_color = this.button_swipe_front_color.clone();
        schema.button_swipe_pressed_front_color = this.button_swipe_pressed_front_color.clone();
        schema.font_size = this.font_size;
        schema.swipe_font_size = this.swipe_font_size;
        schema.corner_radius = this.corner_radius;
        schema.border_color = this.border_color.clone();
        schema.border_size = this.border_size;
        schema.text_color = this.text_color.clone();
        schema.lower_edge_color = this.lower_edge_color.clone();
        schema.shadow_color = this.shadow_color.clone();
        schema.shadow_size = this.shadow_size;
        schema.hilited_candidate_back_color = this.hilited_candidate_back_color.clone();
        schema.hilited_candidate_text_color = this.hilited_candidate_text_color.clone();
        schema.hilited_candidate_label_color = this.hilited_candidate_label_color.clone();
        schema.hilited_comment_text_color = this.hilited_comment_text_color.clone();
        schema.candidate_text_color = this.candidate_text_color.clone();
        schema.comment_text_color = this.comment_text_color.clone();
        schema.label_color = this.label_color.clone();
        schema.hilited_callout_back_color = this.hilited_callout_back_color.clone();
        schema.hilited_callout_foreground_color = this.hilited_callout_foreground_color.clone();
        schema.action_callout_back_color = this.action_callout_back_color.clone();
        return schema;
    }
}

export class KeyStyle {
    id: number = newId();
    name: string = "name";
    buttonBackgroundColor: Color = new Color();
    pressedButtonBackgroundColor: Color = new Color();
    buttonForegroundColor: Color = new Color();
    pressedButtonForegroundColor: Color = new Color();
    swipeForegroundColor: Color = new Color();
    pressedSwipeForegroundColor: Color = new Color();
    buttonBubbleBackgroundColor: Color = new Color();
    actionCalloutBackgroundColor: Color = new Color();
    actionCalloutSelectedBackgroundColor: Color = new Color();
    actionCalloutSelectedForegroundColor: Color = new Color("");
    cornerRadius: number = -1;
    borderSize: number = -1;
    borderColor: Color = new Color("");
    lowerEdgeColor: Color = new Color("");
    shadowColor: Color = new Color("");
    shadowSize: number = -1;
    fontSize: number = 0;
    swipeFontSize: number = 0;

    toObject(): object {
        var obj: any = {};
        obj.name = this.name;
        obj.buttonBackgroundColor = this.buttonBackgroundColor.abgr() || undefined;
        obj.pressedButtonBackgroundColor = this.pressedButtonBackgroundColor.abgr() || undefined;
        obj.buttonForegroundColor = this.buttonForegroundColor.abgr() || undefined;
        obj.pressedButtonForegroundColor = this.pressedButtonForegroundColor.abgr() || undefined;
        obj.swipeForegroundColor = this.swipeForegroundColor.abgr() || undefined;
        obj.pressedSwipeForegroundColor = this.pressedSwipeForegroundColor.abgr() || undefined;
        obj.buttonBubbleBackgroundColor = this.buttonBubbleBackgroundColor.abgr() || undefined;
        obj.actionCalloutBackgroundColor = this.actionCalloutBackgroundColor.abgr() || undefined;
        obj.actionCalloutSelectedBackgroundColor = this.actionCalloutSelectedBackgroundColor.abgr() || undefined;
        obj.actionCalloutSelectedForegroundColor = this.actionCalloutSelectedForegroundColor.abgr() || undefined;
        obj.cornerRadius = this.cornerRadius >= 0 ? this.cornerRadius : undefined;
        obj.borderSize = this.borderSize >= 0 ? this.borderSize : undefined;
        obj.borderColor = this.borderColor.abgr() || undefined;
        obj.lowerEdgeColor = this.lowerEdgeColor.abgr() || undefined;
        obj.shadowColor = this.shadowColor.abgr() || undefined;
        obj.shadowSize = this.shadowSize >= 0 ? this.shadowSize : undefined;
        obj.fontSize = this.fontSize || undefined;
        obj.swipeFontSize = this.swipeFontSize || undefined;
        return obj;
    }

    fromObject(obj: any): void {
        if (obj && typeof obj === "object") {
            this.name = obj.name || this.name;
            this.buttonBackgroundColor.fromAbgr(asString(obj.buttonBackgroundColor));
            this.pressedButtonBackgroundColor.fromAbgr(asString(obj.pressedButtonBackgroundColor));
            this.buttonForegroundColor.fromAbgr(asString(obj.buttonForegroundColor));
            this.pressedButtonForegroundColor.fromAbgr(asString(obj.pressedButtonForegroundColor));
            this.swipeForegroundColor.fromAbgr(asString(obj.swipeForegroundColor));
            this.pressedSwipeForegroundColor.fromAbgr(asString(obj.pressedSwipeForegroundColor));
            if (obj.buttonBubbleBackgroundColor) {
                this.buttonBubbleBackgroundColor.fromAbgr(asString(obj.buttonBubbleBackgroundColor));
            } else {
                this.buttonBubbleBackgroundColor.fromAbgr(asString(obj.buttonBubbleBackColor));
            }
            this.actionCalloutBackgroundColor.fromAbgr(asString(obj.actionCalloutBackgroundColor));
            this.actionCalloutSelectedBackgroundColor.fromAbgr(asString(obj.actionCalloutSelectedBackgroundColor));
            this.actionCalloutSelectedForegroundColor.fromAbgr(asString(obj.actionCalloutSelectedForegroundColor));
            this.cornerRadius = asNumber(obj.cornerRadius, -1);
            this.borderSize = asNumber(obj.borderSize, -1);
            this.borderColor.fromAbgr(asString(obj.borderColor));
            this.lowerEdgeColor.fromAbgr(asString(obj.lowerEdgeColor));
            this.shadowColor.fromAbgr(asString(obj.shadowColor));
            this.shadowSize = asNumber(obj.shadowSize, -1);
            this.fontSize = asNumber(obj.fontSize);
            this.swipeFontSize = asNumber(obj.swipeFontSize);
        }
    }

    clone(): KeyStyle {
        var keyStyle = new KeyStyle();
        keyStyle.name = this.name;
        keyStyle.buttonBackgroundColor = this.buttonBackgroundColor.clone();
        keyStyle.pressedButtonBackgroundColor = this.pressedButtonBackgroundColor.clone();
        keyStyle.buttonForegroundColor = this.buttonForegroundColor.clone();
        keyStyle.pressedButtonForegroundColor = this.pressedButtonForegroundColor.clone();
        keyStyle.swipeForegroundColor = this.swipeForegroundColor.clone();
        keyStyle.pressedSwipeForegroundColor = this.pressedSwipeForegroundColor.clone();
        keyStyle.buttonBubbleBackgroundColor = this.buttonBubbleBackgroundColor.clone();
        keyStyle.actionCalloutBackgroundColor = this.actionCalloutBackgroundColor.clone();
        keyStyle.actionCalloutSelectedBackgroundColor = this.actionCalloutSelectedBackgroundColor.clone();
        keyStyle.actionCalloutSelectedForegroundColor = this.actionCalloutSelectedForegroundColor.clone();
        keyStyle.cornerRadius = this.cornerRadius;
        keyStyle.borderSize = this.borderSize;
        keyStyle.lowerEdgeColor = this.lowerEdgeColor.clone();
        keyStyle.shadowColor = this.shadowColor.clone();
        keyStyle.fontSize = this.fontSize;
        keyStyle.swipeFontSize = this.swipeFontSize;
        return keyStyle;
    }
}
