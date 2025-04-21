// Copyright (c) 2025 tristone13th
// This software is released under the MIT License, see LICENSE.
import { App, MarkdownView, Plugin, PluginSettingTab } from "obsidian";

export default class ShortTabName extends Plugin {
	async renameTab() {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		leaves.forEach((leaf) => {
			/*
			 * 在 Obsidian 刚打开时，由于懒加载的方式，view 没有 file 属性，需要我们
			 * 手动去触发一次 reload。通过 setViewState 重新应用视图状态， 这会强制视图
			 * 重新初始化并加载对应的文件，从而填充 file 属性。如果打开的标签页较多，
			 * 可能会略微增加启动时间。
			 */
			const view = leaf.view as MarkdownView;
			const state = leaf.getViewState();
			if (state.state?.file && !view?.file) {
				leaf.setViewState({ type: state.type, state: state.state });
			}

			if (view?.file) {
				const file = view.file;
				const cache = this.app.metadataCache.getFileCache(file);
				const frontmatterTitle = cache?.frontmatter?.title;
				const tabHeaderEl = (leaf as any).tabHeaderEl as
					| HTMLElement
					| undefined;
				/*
				 * Possible alternatives (from deepseek-r1)
				 *
				 *  方法 2：通过 Obsidian 官方 API 查找
				 *  1. const tabHeaderEl = this.app.workspace.getActiveTabHeader(view.leaf);
				 *
				 *  方法 3：深度遍历 DOM（兼容性强）
				 *  2. const tabHeaderEl = this.findTabHeaderByView(view);
				 */
				if (tabHeaderEl) {
					const titleEl = tabHeaderEl.querySelector(
						".workspace-tab-header-inner-title",
					);
					if (titleEl) {
						titleEl.setText(frontmatterTitle || file.basename);
					}

					tabHeaderEl.setAttribute(
						"aria-label",
						frontmatterTitle || file.basename,
					); // 无障碍标签
					tabHeaderEl.setAttribute(
						"title",
						frontmatterTitle || file.basename,
					);
				}
			}
		});
	}

	async onload() {
		await this.renameTab();

		this.registerEvent(
			this.app.workspace.on("layout-change", () => this.renameTab()),
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => this.renameTab()),
		);

		this.registerEvent(
			this.app.workspace.on("file-open", () => this.renameTab()),
		);

		this.registerEvent(this.app.vault.on("rename", () => this.renameTab()));
		this.registerEvent(
			this.app.metadataCache.on("changed", () => this.renameTab()),
		);
	}

	onunload() {}
}
