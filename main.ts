import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
interface ShortTabNameSettings {
	ignore: string;
	show: string;
}

const DEFAULT_SETTINGS: ShortTabNameSettings = {
	ignore: '[0-9]+-',
	show: '.*'
}

export default class ShortTabName extends Plugin {
	settings: ShortTabNameSettings;

	async renameTab() {
		// console.log("renaming");

		const ignore = this.settings?.ignore;
		const show = this.settings?.show;
		const strregexp = RegExp(`(${ignore})(?<title>${show})`);
		const mdtabs = document.querySelectorAll(".workspace-tab-header[data-type='markdown']");
		mdtabs.forEach(
			(mdtab)=>{
					const tabname = mdtab.getAttribute('aria-label');
					const match = tabname?.match(strregexp);
					const newtabname = match?.groups?.['title'];
					const mdtabinners = mdtab.getElementsByClassName('workspace-tab-header-inner-title');
					if(newtabname)
						mdtabinners.item?.(0)?.setText(newtabname);
				}
			);
	}

	async onload() {
		await this.loadSettings();
		await this.renameTab();

		this.addSettingTab(new ShortTabNameSettingTab(this.app, this));

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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.renameTab();
	}
}
class ShortTabNameSettingTab extends PluginSettingTab {
	plugin: ShortTabName;

	constructor(app: App, plugin: ShortTabName) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('ignore')
			.setDesc(`regexp for ignore header of filename 
			default:${DEFAULT_SETTINGS.ignore} 
			`)
			.addText(text => text
				.setPlaceholder('[0-9]+-')
				.setValue(this.plugin.settings.ignore)
				.onChange(async (value) => {
					this.plugin.settings.ignore = value;
					await this.plugin.saveSettings();
				}));

			new Setting(containerEl)
				.setName('show')
				.setDesc(`regexp for show as tab name 
				default:${DEFAULT_SETTINGS.show} 
				`)
				.addText(text => text
					.setPlaceholder('.*')
					.setValue(this.plugin.settings.show)
					.onChange(async (value) => {
						this.plugin.settings.show = value;
						await this.plugin.saveSettings();
					}));
		}
}
