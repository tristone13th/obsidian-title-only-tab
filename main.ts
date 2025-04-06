// Copyright (c) 2025 tristone13th
// This software is released under the MIT License, see LICENSE.
import { App, MarkdownView, Plugin, PluginSettingTab } from 'obsidian';

export default class ShortTabName extends Plugin {
	async renameTab() {
		const leaves = this.app.workspace.getLeavesOfType('markdown');
		leaves.forEach(leaf => {
			const view = leaf.view as MarkdownView;
			if (view?.file) {
				const file = view.file;
				const cache = this.app.metadataCache.getFileCache(file);
				const frontmatterTitle = cache?.frontmatter?.title;
				const tabHeaderEl = (leaf as any).tabHeaderEl as HTMLElement | undefined;
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
					const titleEl = tabHeaderEl.querySelector('.workspace-tab-header-inner-title');
					if (titleEl) {
						titleEl.setText(frontmatterTitle || file.basename);
					}

					tabHeaderEl.setAttribute('aria-label', frontmatterTitle || file.basename);  // 无障碍标签
					tabHeaderEl.setAttribute('title', frontmatterTitle || file.basename);
				}
			}
		});
	}

	async onload() {
		await this.renameTab();

		this.registerEvent(
			this.app.workspace.on('layout-change',()=>this.renameTab())
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change',()=>this.renameTab())
		);

		this.registerEvent(
			this.app.workspace.on('file-open',()=>this.renameTab())
		);

		this.registerEvent(
			this.app.vault.on('rename',()=>this.renameTab())
		);
		this.registerEvent(
			this.app.metadataCache.on('changed',()=>this.renameTab())
		);
	}

	onunload() {
	}
}
