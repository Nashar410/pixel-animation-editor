import { Scene, Layer, Sprite, Camera } from '../../types';

export interface HierarchyItem {
    id: string;
    name: string;
    type: 'scene' | 'layer' | 'sprite' | 'camera' | 'audio' | 'dialogue';
    parent?: string;
    children?: string[];
    visible?: boolean;
    locked?: boolean;
    icon?: string;
}

export interface HierarchyCallbacks {
    onItemSelect?: (itemId: string) => void;
    onItemRename?: (itemId: string, newName: string) => void;
    onItemDelete?: (itemId: string) => void;
    onItemVisibilityToggle?: (itemId: string) => void;
    onItemReorder?: (itemId: string, newParentId: string, index: number) => void;
}

export class HierarchyPanel {
    private container: HTMLElement;
    private items: Map<string, HierarchyItem> = new Map();
    private selectedItemId: string | null = null;
    private callbacks: HierarchyCallbacks;

    constructor(container: HTMLElement, callbacks: HierarchyCallbacks = {}) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.container.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }

    private handleClick(e: MouseEvent): void {
        const itemElement = (e.target as HTMLElement).closest('.tree-item');
        if (!itemElement) return;

        const itemId = itemElement.getAttribute('data-item-id');
        if (!itemId) return;

        this.selectItem(itemId);
    }

    private handleDoubleClick(e: MouseEvent): void {
        const itemElement = (e.target as HTMLElement).closest('.tree-item');
        if (!itemElement) return;

        const itemId = itemElement.getAttribute('data-item-id');
        if (!itemId) return;

        this.startRename(itemId);
    }

    private handleContextMenu(e: MouseEvent): void {
        e.preventDefault();
        const itemElement = (e.target as HTMLElement).closest('.tree-item');
        if (!itemElement) return;

        const itemId = itemElement.getAttribute('data-item-id');
        if (!itemId) return;

        // TODO: Afficher un menu contextuel
    }

    public selectItem(itemId: string): void {
        // Retirer la sélection précédente
        if (this.selectedItemId) {
            const prevElement = this.container.querySelector(`[data-item-id="${this.selectedItemId}"]`);
            prevElement?.classList.remove('selected');
        }

        // Ajouter la nouvelle sélection
        const element = this.container.querySelector(`[data-item-id="${itemId}"]`);
        element?.classList.add('selected');

        this.selectedItemId = itemId;
        this.callbacks.onItemSelect?.(itemId);
    }

    private startRename(itemId: string): void {
        const item = this.items.get(itemId);
        if (!item) return;

        const element = this.container.querySelector(`[data-item-id="${itemId}"]`);
        const nameElement = element?.querySelector('.tree-item-name');
        if (!nameElement) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.name;
        input.className = 'tree-item-rename-input';

        nameElement.innerHTML = '';
        nameElement.appendChild(input);
        input.focus();
        input.select();

        const finishRename = () => {
            const newName = input.value.trim();
            if (newName && newName !== item.name) {
                this.callbacks.onItemRename?.(itemId, newName);
            }
            this.render(); // Re-render pour afficher le nom
        };

        input.addEventListener('blur', finishRename);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishRename();
            } else if (e.key === 'Escape') {
                this.render();
            }
        });
    }

    public loadScene(scene: Scene): void {
        this.items.clear();

        // Ajouter la scène
        this.addItem({
            id: scene.id,
            name: scene.name,
            type: 'scene',
            children: []
        });

        // Ajouter la caméra
        this.addItem({
            id: scene.camera.id,
            name: 'Caméra principale',
            type: 'camera',
            parent: scene.id
        });

        // Ajouter les layers
        scene.layers.forEach(layer => {
            this.addLayer(layer, scene.id);
        });

        this.render();
    }

    private addLayer(layer: Layer, parentId: string): void {
        this.addItem({
            id: layer.id,
            name: layer.name,
            type: 'layer',
            parent: parentId,
            visible: layer.visible,
            children: []
        });

        // Ajouter les sprites du layer
        layer.sprites?.forEach(sprite => {
            this.addItem({
                id: sprite.id,
                name: sprite.name,
                type: 'sprite',
                parent: layer.id,
                visible: sprite.properties.visible
            });
        });
    }

    public addItem(item: HierarchyItem): void {
        this.items.set(item.id, item);

        // Mettre à jour le parent
        if (item.parent) {
            const parent = this.items.get(item.parent);
            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(item.id);
            }
        }
    }

    public removeItem(itemId: string): void {
        const item = this.items.get(itemId);
        if (!item) return;

        // Retirer des enfants du parent
        if (item.parent) {
            const parent = this.items.get(item.parent);
            if (parent && parent.children) {
                parent.children = parent.children.filter(id => id !== itemId);
            }
        }

        // Supprimer récursivement les enfants
        if (item.children) {
            item.children.forEach(childId => this.removeItem(childId));
        }

        this.items.delete(itemId);
        this.render();
    }

    private render(): void {
        const treeContainer = this.container.querySelector('.hierarchy-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '';

        // Trouver les items racines
        const rootItems = Array.from(this.items.values()).filter(item => !item.parent);

        rootItems.forEach(item => {
            const element = this.renderItem(item, 0);
            if (element) treeContainer.appendChild(element);
        });
    }

    private renderItem(item: HierarchyItem, level: number): HTMLElement | null {
        const element = document.createElement('div');
        element.className = 'tree-item';
        element.setAttribute('data-item-id', item.id);
        element.style.paddingLeft = `${level * 24 + 8}px`;

        if (item.id === this.selectedItemId) {
            element.classList.add('selected');
        }

        // Icône
        const icon = document.createElement('span');
        icon.className = 'tree-item-icon';
        icon.innerHTML = this.getIcon(item.type);

        // Nom
        const name = document.createElement('span');
        name.className = 'tree-item-name';
        name.textContent = item.name;

        element.appendChild(icon);
        element.appendChild(name);

        // Ajouter les enfants
        if (item.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-item-children';

            item.children.forEach(childId => {
                const childItem = this.items.get(childId);
                if (childItem) {
                    const childElement = this.renderItem(childItem, level + 1);
                    if (childElement) childrenContainer.appendChild(childElement);
                }
            });

            element.appendChild(childrenContainer);
        }

        return element;
    }

    private getIcon(type: string): string {
        const icons: Record<string, string> = {
            scene: '<svg class="icon" viewBox="0 0 16 16"><path d="M2 2h12v12H2V2zm1 1v10h10V3H3z"/></svg>',
            layer: '<svg class="icon" viewBox="0 0 16 16"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z"/></svg>',
            sprite: '<svg class="icon" viewBox="0 0 16 16"><path d="M4 4h8v8H4V4zm1 1v6h6V5H5z"/></svg>',
            camera: '<svg class="icon" viewBox="0 0 16 16"><path d="M2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1l3 2V4l-3 2V5a1 1 0 0 0-1-1H2z"/></svg>',
            audio: '<svg class="icon" viewBox="0 0 16 16"><path d="M4 5v6l4-2V7l4 3V2L8 5l-4-2v2z"/></svg>',
            dialogue: '<svg class="icon" viewBox="0 0 16 16"><path d="M2 3h12v8H8l-4 3v-3H2V3z"/></svg>'
        };

        return icons[type] || icons.sprite;
    }
}