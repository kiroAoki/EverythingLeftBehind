import PuzzleGame from '../puzzles/foto-rasgada.js';
import CameraPuzzle from '../puzzles/camera-senha.js';
import RetratoPuzzle from '../puzzles/retrato-puzzle.js';
import CadernoPuzzle from '../puzzles/caderno-helena.js';
import RoomManager from '../managers/RoomManager.js';
import Inventory from '../ui/Inventory.js';
import { sizes } from '../constants.js';
import GameState from './GameState.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.CameraPuzzle = null;
        this.roomManager = null;
        this.bg = null;
        this.tooltip = null;
        this.arrows = {
            left: null,
            right: null
        };
        this.standardRooms = ['mapa1', 'mapa2', 'mapa3', 'mapa4'];
        this.currentMapKey = null;
        this.inspectionScreen = null;
        this.canetasSprites = []; // Armazena todas as canetas
        this.marcadoresSprites = []; // Armazena todos os marcadores

        //teste zoom
        this.zoomView = {
            active: false,
            currentItem: null,
            overlay: null,
            blurBg: null,
            closeButton: null,
            zoomedItem: null
        };
    }

    //=========================================================================================================

    preload() {
        // Carrega todos os fundos
        this.load.image('bg1', './assets/images/paredeNorte_0.png');
        this.load.image('bg2', './assets/images/paredeOeste_0.png');
        this.load.image('bg3', './assets/images/paredeSul_0.png');
        this.load.image('bg4', './assets/images/paredeLeste_0.png');
        this.load.image('caixaclara', './assets/images/CaixaClara.png');
        this.load.image('paredeComCaixa', './assets/images/ParedecomCaixa.png');
        this.load.image('retrato', './assets/images/fotoArmario.png');
        this.load.image('gaveta', './assets/images/gavetaTrancada.png');
        this.load.image('caixa', './assets/images/Caixa.png');
        this.load.image('mapa', './assets/images/mapaMundi.png');
        this.load.image('mapaMundiAlterado', './assets/images/mapaMundiAlterado.png');
        this.load.image('bg-pedras', './assets/images/ParedeQuadro_Vazio.png'); //Placeholder
        this.load.image('bg-canetas', './assets/images/ParedeQuadro_Vazio.png'); //Placeholder
        this.load.image('bg-marcapag', './assets/images/ParedeQuadro_Vazio.png'); //Placeholder
        this.load.image('notebookLeftPage', './assets/images/objects/notebookEsquerdo.png');
        this.load.image('notebookRightPage', './assets/images/objects/notebookDireito.png');
        this.load.image('paperPiece1', './assets/images/objects/paperPiece1.png');
        this.load.image('bg-caderno', './assets/images/ParedeQuadro_Vazio.png');
        this.load.image('paperPiece1', './assets/images/objects/paperPiece1.png');
        this.load.image('paperPiece2', './assets/images/objects/paperPiece1.png');
        this.load.image('paperPiece3', './assets/images/objects/paperPiece1.png');
        this.load.image('paperPiece4', './assets/images/objects/paperPiece1.png');
        this.load.image('bg-caixaMae', './assets/images/caixaMae.png');
        this.load.image('imagemFinal', './assets/images/imagemFinal.png');
        this.load.image('fotoClara', './assets/images/fotoClara.png');
        // this.load.image('bg-cartas', './assets/images/ParedeQuadro_Vazio.png'); //Placeholder

        // Carrega os mapas
        this.load.json('mapa1', './maps/ParedeNorteDefinitiva.json');
        this.load.json('mapa2', './maps/paredeSulDefinitiva.json');
        this.load.json('mapa3', './maps/paredeLesteDefinitiva.json');
        this.load.json('mapa4', './maps/paredeOesteDefinitiva.json');
        this.load.json('caixaclara', './maps/caixaClara.json');
        this.load.json('caixahelena', './maps/caixaHelena.json');
        this.load.json('caixarafael', "./maps/caixaRafael.json");
        this.load.json('paredeComCaixa', './maps/SemQuadroFotoRasgada.json');
        this.load.json('retrato', './maps/retrato.json');
        this.load.json('gaveta', './maps/gavetaComCamera.json');
        this.load.json('mapa', './maps/mapaMundi.json');
        this.load.json('pedras', './maps/pedras.json');
        this.load.json('canetas', './maps/canetas.json');
        this.load.json('marcapag', './maps/marcaPaginas.json');
        this.load.json('caderno', './maps/caderno.json');
        this.load.json('caixaMae', './maps/caixaMae.json');
        this.load.json('fim', './map/fim.json');
        // this.load.json('cartas', './maps/cartas.json');

        // Carrega ícone de seta
        this.load.image('seta', './/assets/ui/seta.png');

        //Itens de Inventários
        this.load.image('notebookOpen', './assets/images/objects/notebookOpen.png');
        this.load.image('keychain', './assets/images/objects/keychain.png');
        this.load.image('rockCollection', './assets/images/objects/rockCollection.png');
        this.load.image('Notebook_Item', './assets/images/objects/Notebook_Item.png');
        this.load.image('camera', './assets/images/objects/camera.png');
        this.load.image('marcaPag1', './assets/images/objects/marcaPag1.png');
        this.load.image('marcaPag2', './assets/images/objects/marcaPag2.png');
        this.load.image('caneta1', './assets/images/objects/caneta1.png');
        this.load.image('caneta2', './assets/images/objects/caneta2.png');
        this.load.image('polaroid', './assets/images/objects/polaroid.png');
        this.load.image('pedacoMapa', './assets/images/objects/pedacoMapa.png');
        // this.load.image('pilhaCartas', './assets/images/objects/pilhaCartas.png');

        //Inventário
        this.load.image('backpack', './assets/images/backpack.png');
        this.load.image('slot', './assets/images/Slot.png');
        this.load.image('inventory', './assets/images/InventoryOverlay.png');
        this.load.image('iconInventory', './assets/images/inventoryicon.png');
    }

    //=========================================================================================================

    create() {
        this.lastClickedObject = null;
        this.navigationHistory = [];
        // Inicializa o gerenciador de quartos
        this.roomManager =  new RoomManager(this);
        this.gameState = new GameState();
        

        

        // Configura o fundo
        this.bg = this.add.image(0, 0, 'bg1').setOrigin(0, 0);
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;

        // Cria as setas de navegação
        this.createNavigationArrows();

        this.inventory = new Inventory(this);
        this.cadernoPuzzle = new CadernoPuzzle(this, 'notebookOpen');

        // Configura o tooltip
        this.tooltip = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#fff',
            padding: { x: 5, y: 2 },
            resolution: 3, // Dobra a resolução do texto
        }).setDepth(100).setVisible(false);
        // Carrega o primeiro quarto (com pequeno delay para garantir inicialização)
        this.time.delayedCall(100, () => {
            this.roomManager.loadRoom(1);
        });

        // Caixa de diálogo inferior
        this.textBoxBackground = this.add.rectangle(0, sizes.height - 60, sizes.width, 60, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setDepth(100)
            .setVisible(false);

        this.textBox = this.add.text(10, sizes.height - 55, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            resolution: 3,
            color: '#ffffff',
            wordWrap: { width: sizes.width - 20 }
        })
            .setDepth(101)
            .setVisible(true);

        //=========================================================================================================
        //              HITBOXES
        //=========================================================================================================

        // Botões na ESQUERDA
        this.buttonOpen = this.add.text(0, sizes.height - 25, '[Abrir]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#00ff00',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
.on('pointerdown', () => {
    const obj = this.lastClickedObject || this._lastClickedObjectCache;
    console.log('Tentando abrir objeto:', obj?.name);
    if (obj.name === "gavetaGrande") {
        this.loadCustomMap('gaveta', 'gaveta');
    }
    if (this.lastClickedObject) {
        if (this.lastClickedObject.name === "caixaClara") {
            this.loadCustomMap('caixaclara', 'caixa');
        }
        else if (this.lastClickedObject.name === "Caixa sobre Helena") {
            this.loadCustomMap('caixahelena', 'caixa');
        }
        else if (this.lastClickedObject.name === "Caixa do Rafael") {
            this.loadCustomMap('caixarafael', 'caixa');
        }
        else if (this.lastClickedObject.name === "QuadroBanana") {
            this.loadCustomMap('paredeComCaixa', 'paredeComCaixa');
        }
        else if (this.lastClickedObject.name === "PrateleiraArmario") {
            this.loadCustomMap('retrato', 'retrato');
        }
        else if (this.lastClickedObject.name === "gavetaGrande") {
            this.loadCustomMap('gaveta', 'gaveta');
        }
        else if (this.lastClickedObject.name === "Quadro") {
            this.loadCustomMap('mapa', 'mapa');
        }
        else if (this.lastClickedObject.name === "Caixa da Mãe") {
            this.loadCustomMap('fim', 'imagemFinal');
        }
    }
    this.hideTextBox(); // Esta linha garante que a caixa será fechada
})


.setDepth(101)
.setVisible(false);


        //=========================================================================================================
        //=========================================================================================================
        //=========================================================================================================

        this.buttonClose = this.add.text(60, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ff0000',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

        this.buttonCloseDialogue = this.add.text(0, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ff0000',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

        this.setInteractionsEnabled(true);

        if (!this.gameState.cameraUnlocked) {
        this.cameraPuzzle = new CameraPuzzle(this);
        
        // Configura o listener para quando o puzzle for completado
        this.events.once('cameraPuzzleCompleted', () => {
            this.handleCameraUnlock();
        });
    }

            this.retratoPuzzle = new RetratoPuzzle(this, "07/11/1999");
            this.events.on('retratoPuzzleCompleted', () => {
                this.gameState.rafaelStorylineCompleted = true;
                console.log("Rafael storyline completa: ", this.gameState.rafaelStorylineCompleted);
                if (this.checkAllStorylinesCompleted()) {
        this.loadFinalMap();
    }

            });


            this.notebook = this.add.sprite(x, y, 'notebook');
this.notebook.setInteractive();
this.notebook.on('pointerdown', () => {
    this.scene.start('CadernoScene');
});
    }
    

    update () {
    // Verificação de consistência
    if (this.bg.texture.key !== this.getExpectedBackground()) {
        console.warn('Inconsistência detectada! Recriando background...');
        this.bg.destroy();
        this.bg = this.add.image(0, 0, this.getExpectedBackground())
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);
    }
}

getExpectedBackground() {
    // Mapeia currentMapKey para o background esperado
    const mapToBg = {
        'mapa1': 'bg1',
        'mapa2': 'bg2',
        'mapa3': 'bg3',
        'mapa4': 'bg4',
        'gaveta': 'gaveta', // ajuste conforme seus assets
    'caixaclara': 'caixa',
        'caixarafael': 'caixa',
        'caixahelena': 'caixa',
        'paredeComCaixa': 'paredeComCaixa',
        'retrato': 'retrato',
        'mapa': this.gameState.mapaAlterado ? 'mapaMundiAlterado' : 'mapa',
        // 'cartas': 'bg-cartas',
        'pedras': 'bg-pedras',
        'canetas': 'bg-canetas',
        'marcapag': 'bg-marcapag'
    };
    return mapToBg[this.currentMapKey] || 'bg1';
}

    //=========================================================================================================

    setInteractionsEnabled(state) {
        // Se estiver em zoom, sempre desativa interações normais
        if (this.zoomView.active) state = false;

        // Ativa/desativa todas as zonas interativas
        this.roomManager.interactiveZones.forEach(zone => {
            zone.input.enabled = state;
        });

        // Ativa/desativa as setas
        this.arrows.left.setInteractive({ enabled: state });
        this.arrows.right.setInteractive({ enabled: state });

        // Tooltip só aparece se interações estiverem ativas
        this.tooltip.setVisible(false);

        // Ativa/desativa o inventário (exceto se estiver em zoom)
        if (this.inventory) {
            this.inventory.toggleButton.setInteractive({ enabled: !this.zoomView.active });
        }
    }

    //=========================================================================================================

    loadCustomMap(mapKey, bgKey) {
    // Verifica se é o mapa que pode ser alterado
    if (this.currentMapKey === mapKey) return;

    if (mapKey === 'mapa' && this.gameState.mapaAlterado) {
        bgKey = 'mapaMundiAlterado'; // Força o fundo alterado
    }
    
    console.log(`[DEBUG] Carregando mapa: ${mapKey}`);
    console.log(`Mapa no cache: ${this.cache.json.has(mapKey)}`);

    // Resto do método original...
    if (this.currentMapKey && this.bg.texture) {
        this.navigationHistory.push({
            mapKey: this.currentMapKey,
            bgKey: this.bg.texture.key
        });
    }
    
    this.roomManager.clearPreviousZones();
    
    if (bgKey) {
        this.updateBackground(bgKey);
    }
    
    this.loadMapObjects(mapKey);
    this.currentMapKey = mapKey;
    
    this.updateArrowsVisibility();
}

    //=========================================================================================================

    checkAllStorylinesCompleted() {
    return this.gameState.claraStorylineCompleted && 
           this.gameState.rafaelStorylineCompleted && 
           this.gameState.helenaStorylineCompleted;
}

    goBackToPreviousMap() {
    // Fecha qualquer diálogo aberto
    this.hideTextBox();

    // Limpa todos os sprites temporários
    this.clearItemSprites();
    
    if (this.navigationHistory.length > 0) {
        const previous = this.navigationHistory.pop();
        console.log(`[DEBUG] Voltando para: ${previous.mapKey} com bg: ${previous.bgKey}`);

        this.bg.destroy();
        this.bg = this.add.image(0, 0, previous.bgKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);
        
        this.roomManager.clearPreviousZones(true);
        this.loadMapObjects(previous.mapKey);
        this.currentMapKey = previous.mapKey;
        
        this.updateArrowsVisibility();
    } else {
        this.loadCustomMap('mapa1', 'bg1');
    }
}

loadFinalMap() {
    // Desativa interações temporariamente
    this.setInteractionsEnabled(false);
    
    // Mostra mensagem de conclusão (opcional)
    this.showTextBoxDialogue("Todas as histórias foram reveladas... Algo novo se abre!");
    
    // Aguarda um pouco antes de carregar o mapa final
    this.time.delayedCall(3000, () => {
        // Carrega o mapa especial de conclusão
        this.loadCustomMap('caixaMae', 'bg-caixaMae');
        
        // Reativa interações
        this.setInteractionsEnabled(true);
    });
}

    //=========================================================================================================

    isStandardRoom() {
    // Lista de salas que devem ter setas desativadas
    const nonStandardRooms = ['cartas', 'pedras', 'caixaclara', 'caixahelena', 
                            'caixarafael', 'paredeComCaixa', 'retrato', 
                            'gaveta', 'mapa'];
    return !nonStandardRooms.includes(this.currentMapKey) && 
           this.standardRooms.includes(this.currentMapKey);
}

    //=========================================================================================================

    createNavigationArrows() {
        // Seta esquerda
        this.arrows.left = this.add.image(20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setAngle(180)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.prevRoom(); // Comportamento normal
                }
            });

        // Seta direita
        this.arrows.right = this.add.image(this.scale.width - 20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setInteractive({ useHandCursor: true })
            .setDepth(1002)
            .on('pointerdown', () => {
                if (this.inventory.isVisible == false) {
                    this.roomManager.nextRoom(); // Comportamento normal
                }
            });
    }

    //=========================================================================================================

    updateArrowsVisibility() {
    const shouldShowArrows = this.isStandardRoom();
    this.arrows.left.setVisible(shouldShowArrows);
    this.arrows.right.setVisible(shouldShowArrows);
}

    //=========================================================================================================

    updateBackground(bgKey) {
        this.bg.setTexture(bgKey);
    }

    //=========================================================================================================

    loadMapObjects(mapKey) {
    console.log(`Carregando objetos do mapa: ${mapKey}`); // Debug
    
    this.clearCanetas();
    this.clearMarcadores();

    const mapData = this.cache.json.get(mapKey);
    if (!mapData) {
        console.error(`Mapa ${mapKey} não encontrado no cache!`);
        return;
    }

    mapData.layers.forEach(layer => {
        console.log(`Camada: ${layer.name} (${layer.type})`); // Debug
        
        if (layer.type === 'objectgroup') {
            if (mapKey === 'pedras') {
                    if (layer.name === '28/12/1998' || layer.name === '24/05/1998' || 
                        layer.name === '12/03/1998' || layer.name === '07/11/1999' || 
                        layer.name === '03/04/1999') {
                        layer.objects.forEach(obj => {
                            this.createStoneInteractiveZone(obj, layer.name);
                        });
                        return; // Pula para próxima camada
                    }
                }
            layer.objects.forEach(obj => {
                console.log(`- Objeto: ${obj.name} em (${obj.x},${obj.y})`); // Debug
                
                if (obj.name === 'Chave de Apartamento') { // Modifiquei a condição
                    this.createChave(obj);
                }
                else if (obj.name === 'Pedaço de Mapa-múndi') {
                    this.createMapa(obj);
                }
                else if (obj.name === 'Fotografia Revelada') {
                    this.createFotografia(obj);
                }
                else if (obj.name === 'Coleção de Pedras') {
                    this.createPedra(obj);
                } 
                // else if (obj.name === 'Pilha de Cartas') {
                //     this.createCartas(obj);
                // }
                else if (obj.name === 'Caderno de Escrita') {
                    this.createNotebook(obj);
                }
                else if (obj.name === 'Marcas-página') {
                    this.createMarcaPaginas(obj);
                }
                else if (obj.name === 'Canetas Tinteiro') {
                    this.createCanetas(obj);
                }
                else if (obj.name === 'gavetaCamera') {
                    this.createCamera(obj);
                }

                else if (obj.name === "Caneta Roxa" || obj.name === "Caneta Azul" || obj.name === "Caneta Vermelha" || obj.name === "Caneta Rosa") {
                    this.createCanetaIndividual(obj);
                }

                else if (obj.name === "Caneta Roxa" || obj.name === "Caneta Azul" || 
                    obj.name === "Caneta Vermelha" || obj.name === "Caneta Rosa") {
                    this.createCanetaIndividual(obj);
                }
                else if (obj.name && obj.name.includes("MarcaPag")) {
                        this.createMarcaPaginaIndividual(obj);
                    }
                else {
                    this.createStandardInteractiveZone(obj);
                }
            });
        }
    });
}
    createCanetaIndividual(obj) {
    const imgKey = obj.name.includes("Roxa") || obj.name.includes("Rosa") ? 'caneta2' : 'caneta1';
    
    const sprite = this.add.image(
        obj.x + obj.width/2,
        obj.y + obj.height/2,
        imgKey
    )
    .setDisplaySize(obj.width, obj.height)
    .setOrigin(0.5)
    .setDepth(10);

    const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
        .setOrigin(0)
        .setInteractive()
        .on('pointerover', () => this.showTooltip(obj))
        .on('pointerout', () => this.tooltip.setVisible(false))
        .on('pointerdown', () => this.handleObjectClick(obj));

    // Armazena a referência
    this.canetasSprites.push({
        sprite: sprite,
        zone: zone,
        originalObj: obj
    });

    this.roomManager.interactiveZones.push(zone);
}

createMarcaPaginaIndividual(obj) {
    let imgKey;
    switch(obj.name) {
        case "MarcaPag1": imgKey = 'marcaPag1'; break;
        case "MarcaPag2": imgKey = 'marcaPag2'; break;
        case "MarcaPag3": imgKey = 'marcaPag1'; break;
        case "MarcaPag4": imgKey = 'marcaPag2'; break;
        default: imgKey = 'marcaPag1';
    }

    const sprite = this.add.image(
        obj.x + obj.width/2,
        obj.y + obj.height/2,
        imgKey
    )
    .setDisplaySize(obj.width, obj.height)
    .setOrigin(0.5)
    .setDepth(10);

    const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.showTooltip(obj))
        .on('pointerout', () => this.tooltip.setVisible(false))
        .on('pointerdown', () => this.handleMarcaPaginaClick(obj));

    // Armazena a referência
    this.marcadoresSprites.push({
        sprite: sprite,
        zone: zone,
        originalObj: obj
    });

    this.roomManager.interactiveZones.push(zone);
}

    // <--- MÉTODO MODIFICADO para gerenciar this.notebookSprite
    createChave(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.ChaveSprite) {
            this.ChaveSprite.destroy();
            this.ChaveSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.ChaveSprite = this.add.image( // "ChaveSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'keychain'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Chave de Apartamento', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }
    createPedra(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.PedraSprite) {
            this.PedraSprite.destroy();
            this.PedraSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.PedraSprite = this.add.image( // "PedraSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'rockCollection'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Coleção de Pedras', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }
    createNotebook(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.NotebookSprite) {
            this.NotebookSprite.destroy();
            this.NotebookSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.NotebookSprite = this.add.image( // "NotebookSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'Notebook_Item'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Caderno de Escrita', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createMarcaPaginas(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.MarcaPaginasSprite) {
            this.MarcaPaginasSprite.destroy();
            this.MarcaPaginasSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.MarcaPaginasSprite = this.add.image( // "MarcaPaginasSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'marcaPag1'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Marcas-página', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createCanetas(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.CanetasSprite) {
            this.CanetasSprite.destroy();
            this.CanetasSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.CanetasSprite = this.add.image( // "CanetasSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'caneta1'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Canetas Tinteiro', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createMapa(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.MapaSprite) {
            this.MapaSprite.destroy();
            this.MapaSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.MapaSprite = this.add.image( // "MapaSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'pedacoMapa'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Pedaço de Mapa-múndi', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    // createCartas(obj) {
    //     const targetWidth = 96;
    //     const targetHeight = 96;
    //     const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
    //     const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

    //     // Destrói o sprite anterior do caderno, se existir
    //     if (this.CartasSprite) {
    //         this.CartasSprite.destroy();
    //         this.CartasSprite = null;
    //     }

    //     // Cria o sprite e armazena a referência
    //     this.CartasSprite = this.add.image( // "CartasSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
    //         posX + targetWidth / 2,
    //         posY + targetHeight / 2,
    //         'pilhaCartas'
    //     )
    //         .setDisplaySize(targetWidth, targetHeight)
    //         .setOrigin(0.5, 0.5)
    //         .setDepth(10);

    //     const zone = this.add.zone(
    //         obj.x, obj.y,
    //         obj.width, obj.height
    //     )
    //         .setOrigin(0)
    //         .setInteractive({ useHandCursor: true })
    //         .on('pointerover', () => this.showTooltip({ name: 'Pilha de Cartas', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
    //         .on('pointerout', () => this.tooltip.setVisible(false))
    //         .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

    //     this.roomManager.interactiveZones.push(zone);
    // }

    createFotografia(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.FotografiaSprite) {
            this.FotografiaSprite.destroy();
            this.FotografiaSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.FotografiaSprite = this.add.image( // "FotografiaSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'polaroid'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Fotografia Revelada', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createCamera(obj) {
        const targetWidth = 96;
        const targetHeight = 96;
        const posX = obj.x + (obj.width / 2) - (targetWidth / 2);
        const posY = obj.y + (obj.height / 2) - (targetHeight / 2);

        // Destrói o sprite anterior do caderno, se existir
        if (this.CameraSprite) {
            this.CameraSprite.destroy();
            this.CameraSprite = null;
        }

        // Cria o sprite e armazena a referência
        this.CameraSprite = this.add.image( // "CameraSprite" É A FUNÇÃO PARA CHAMAR O REMOVER OBJETO QUANDO CLICA
            posX + targetWidth / 2,
            posY + targetHeight / 2,
            'camera'
        )
            .setDisplaySize(targetWidth, targetHeight)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        const zone = this.add.zone(
            obj.x, obj.y,
            obj.width, obj.height
        )
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip({ name: 'Câmera Fotográfica', x: obj.x, y: obj.y, width: obj.width, height: obj.height })) // Passa objeto com propriedades para tooltip
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj)); // Passa o obj do Tiled

        this.roomManager.interactiveZones.push(zone);
    }

    createStandardInteractiveZone(obj) {
        const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.showTooltip(obj))
            .on('pointerout', () => this.tooltip.setVisible(false))
            .on('pointerdown', () => this.handleObjectClick(obj));

        this.roomManager.interactiveZones.push(zone);

        // const debugRect = this.add.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height)
        // .setStrokeStyle(1, 0x00ff00)
        // .setDepth(99);
        // this.roomManager.interactiveZones.push(debugRect);
    }

    //=========================================================================================================

    showTooltip(obj) {
        if (this.inventory.isVisible) return;

        this.tooltip.setText(obj.name);

        let posX = obj.x + 10;
        let posY = obj.y - 20;

        if (posY < 0) posY = obj.y + 20;
        if (posX + this.tooltip.width > this.scale.width) posX = this.scale.width - this.tooltip.width - 10;
        if (posX < 0) posX = 10;

        this.tooltip.setPosition(posX, posY).setVisible(true);
    }

    //=========================================================================================================

    handleObjectClick(obj) {
        //         if (obj.name === "caixa pequena") {
        //     this.loadCustomMap('caixaclara', 'caixaclara');
        //     this.showTextBox("Você abriu a caixa pequena.");
        // }

        console.log('[DEBUG] Objeto clicado:', obj.name);
        this.lastClickedObject = obj;
        this._lastClickedObjectCache = obj;
        console.log('lastClickedObject definido como:', this.lastClickedObject);

        if (obj.name === "28/12/98")
            this.showTextBoxDialogue("Esta veio da praia onde fizemos uma viagem de fim de semana, será que ele se lembra do pôr do sol?");
        if (obj.name === "24/05/98")
            this.showTextBoxDialogue("...Que dia maldito...");
        if (obj.name === "12/03/98")
            this.showTextBoxDialogue("Essa aqui a gente achou enquanto andava pelas ruas depois do meu aniversário, você me deu esta pedra dizendo que eu era especial...");
        if (obj.name === "07/11/99")
            this.showTextBoxDialogue("Nesse dia a gente matou aula pela última vez, a gente tava tão feliz, eu não sabia que nosso caminho se separava em breve");
        if (obj.name === "03/04/99")
            this.showTextBoxDialogue("Ele me deu essa pedra por pena, foi quando eu quebrei um braço escorregando em uma casca de banana igual uma idiota");

        if (obj.name === "MarcaPag1")
            this.showTextBoxDialogue("Recado 1 - ano");
        if (obj.name === "MarcaPag2")
            this.showTextBoxDialogue("Recaro 2 - ano");
        if (obj.name === "MarcaPag3")
            this.showTextBoxDialogue("Recado 3 - ano");
        if (obj.name === "MarcaPag4")
            this.showTextBoxDialogue("Recado 4 - ano");

        if (obj.name === "Caneta Roxa")
            this.showTextBoxDialogue("Recado 1");
        if (obj.name === "Caneta Azul")
            this.showTextBoxDialogue("Recado 2");
        if (obj.name === "Caneta Vermelha")
            this.showTextBoxDialogue("Recado 3");
        if (obj.name === "Caneta Rosa")
            this.showTextBoxDialogue("Recado 4");

        if (obj.name === "Chave de Apartamento") {
            this.inventory.addItem('keychain', () => {
                this.showItemZoom('keychain', "Quarto 372, muitas lembranças daquele apartamento");
            });
            this.removeHitboxForObject(obj);
            this.ChaveSprite.destroy(); // REMOVER OBJETO QUANDO CLICA
            return;
        }

        if (obj.name === "Pedaço de Mapa-múndi") {
            this.inventory.addItem('pedacoMapa', () => {
                this.showItemZoom('pedacoMapa');
            })
            this.removeHitboxForObject(obj);
            this.MapaSprite.destroy();
            return;
        }

        if (obj.name === "Fotografia Revelada") {
            this.inventory.addItem('polaroid', () => {
                this.showItemZoom('polaroid');
            })
            this.removeHitboxForObject(obj);
            this.FotografiaSprite.destroy();
            return;
        }

        if (obj.name === "Coleção de Pedras") {
            this.inventory.addItem('rockCollection', () => {
                this.goBackToPreviousMap();
                this.loadCustomMap('pedras', 'pedras')  ;

            });
            this.removeHitboxForObject(obj);
            this.PedraSprite.destroy();
            return;
        }

        // if (obj.name === "Pilha de Cartas") {
        //     this.inventory.addItem('pilhaCartas', () => {
        //         this.goBackToPreviousMap();
        //         this.loadCustomMap('cartas', 'cartas');
        //     })
        //     this.removeHitboxForObject(obj);
        //     this.CartasSprite.destroy();
        //     return;
        // }

        if (obj.name === "Caderno de Escrita") {
            this.inventory.addItem('notebookOpen', () => {
                // Abre o puzzle do caderno ao clicar no inventário
                this.cadernoPuzzle.create();
            });
            this.removeHitboxForObject(obj);
            this.NotebookSprite.destroy();
            return;
        }

        if (obj.name === "Canetas Tinteiro") {
        this.inventory.addItem('caneta1', () => {
            // Carrega o mapa de canetas
            this.goBackToPreviousMap();
            this.loadCustomMap('canetas', 'bg-canetas');
        });
        this.removeHitboxForObject(obj);
        if (this.CanetasSprite) this.CanetasSprite.destroy();
        return;
    }

    if (obj.name === "Marcas-página") {
        this.inventory.addItem('marcaPag1', () => {
            // Carrega o mapa de marcadores
            this.goBackToPreviousMap();
            this.loadCustomMap('marcapag', 'bg-marcapag');
        });
        this.removeHitboxForObject(obj);
        if (this.MarcaPaginasSprite) this.MarcaPaginasSprite.destroy();
        return;
    }

        if (obj.name === "gavetaCamera") {
    this.inventory.addItem('camera', () => {
        if (!this.cameraPuzzle) {
            this.cameraPuzzle = new CameraPuzzle(this);
        }
        this.cameraPuzzle.open();
    });
    this.removeHitboxForObject(obj);
    this.CameraSprite.destroy();
    return;
}

        if (obj.name === "caixaSemQuadro") { // Ou qualquer outro nome que você definir
        this.startPuzzle();
        return;
        }

        if (obj.name === "Caixa da Mãe") {
            this.showTextBoxWithChoices("Eu estou pronta pra isso? Foi por causa de você que eu voltei aqui mãe...");
            this.buttonOpen.setVisible(true);
            this.buttonOpen.setDepth(1000);
        }

        if (obj.name === "gavetaGrande") {
    if (this.gameState.mapaAlterado) {
        // Se o mapa foi alterado, permite abrir a gaveta
        this.showTextBoxWithChoices("Uma gaveta");
        this.buttonOpen.setVisible(true);
        this.buttonOpen.setDepth(1000);
    } else {
        // Se o mapa NÃO foi alterado, mostra mensagem diferente
        this.showTextBoxDialogue("A gaveta está trancada. Parece que preciso alterar algo primeiro...");
        this.buttonOpen.setVisible(false);
    }
    return;
}

        this.lastClickedObject = obj;

        if (this.inventory.isVisible) return;

        //=========================================================================================================
        //          HITBOXES 
        //=========================================================================================================

        if (obj.name === "caixaClara") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui..");
            console.log("RafaelStoryline: ", this.gameState.rafaelStorylineCompleted);
            console.log("ClaraStoryline: ", this.gameState.claraStorylineCompleted);
            console.log("HelenaStoryline: ", this.gameState.helenaStorylineCompleted);
            return;
        }

        if (obj.name === "QuadroBanana") {
            this.showTextBoxWithChoices("Placeholder...");
            return;
        }

        if (obj.name === "PrateleiraArmario") {
            this.hideTextBox();
            if (!this.gameState.retratoCompleted) {
                this.retratoPuzzle.create();
            } else {
                this.showTextBoxDialogue("Já descobri a data deste retrato.");
            }
            return;
        }

        if (obj.name === "gavetaGrande") {
            this.showTextBoxWithChoices("Uma gaveta");
            return;
        }

        if (obj.name === "Caixa sobre Helena") {
            this.showTextBoxWithChoices("Irmã");
            return;
        }

        if (obj.name === "Caixa do Rafael") {
            this.showTextBoxWithChoices("aaaaaaa");
            return;
        }

        if (obj.name === "Quadro") {
            this.showTextBoxWithChoices("Mapa-mundi");
            return;
        }

        if (obj.name === "voltar") {
            this.goBackToPreviousMap();
            return;
        }

        if (this.isStandardRoom()) {
            this.arrows.left.setVisible(true);
            this.arrows.right.setVisible(true);
        } else {
            this.arrows.left.setVisible(false);
            this.arrows.right.setVisible(false);
        }

        // Adicione aqui lógica para interação com objetos específicos
    }

    //=========================================================================================================
    //=========================================================================================================
    //=========================================================================================================

alterarMapaMundi() {
    if (this.currentMapKey === 'mapa') {
        this.gameState.mapaAlterado = true; // Marca como alterado permanentemente
        this.updateBackground('mapaMundiAlterado');
        return true;
    }
    return false;
}

startPuzzle() {
    // Desativa interações normais
    this.setInteractionsEnabled(false);
    
    // Cria o puzzle centralizado na tela
    this.puzzleGame = new PuzzleGame(this, 'pedacoMapa', this.inventory);
    
    // Posiciona no centro da tela
    const x = (sizes.width - 600) / 2;
    const y = (sizes.height - 600) / 2;
    
    this.puzzleGame.create(x, y);
    
    // Armazena a referência à cena para usar dentro do callback
    const scene = this;
    
    // Configura o callback quando o puzzle for completado
    this.puzzleGame.setOnComplete(() => {
    // Adiciona o item usável com verificação de mapa
    this.inventory.addUsableItem('pedacoMapa', 'pedacoMapa', () => {
        // Retorna true se o mapa foi alterado, false caso contrário
        return this.alterarMapaMundi();
    });
    
    // Adiciona o item visual ao inventário
    this.inventory.addItem('pedacoMapa', () => {
        this.showItemZoom('pedacoMapa');
    });

    // Destrói o puzzle
    this.time.delayedCall(500, () => {
        if (this.puzzleGame) {
            this.puzzleGame.destroy();
            this.puzzleGame = null;
        }
        this.setInteractionsEnabled(true);
    });
});
}

handleCameraUnlock() {
    // Atualiza o estado do jogo
    this.gameState.cameraUnlocked = true;
    this.gameState.claraStorylineCompleted = true;
    
    console.log("Clara storyline completa: ",this.gameState.claraStorylineCompleted);

    this.inventory.removeItem('camera');
    
    // Adiciona o novo item ao inventário
    this.inventory.addItem('camera', () => this.useFunctionalCamera());
    
    console.log('Câmera desbloqueada e item atualizado!');
    if (this.checkAllStorylinesCompleted()) {
        this.loadFinalMap();
    }
}

useFunctionalCamera() {
    // Sua lógica de zoom aqui
    console.log('Usando câmera funcional...');
    this.showZoomedImage('fotoClara');
}



    clearItemSprites() {
    // Objetos gerais
    if (this.ChaveSprite) {
        this.ChaveSprite.destroy();
        this.ChaveSprite = null;
    }
    if (this.MapaSprite) {
        this.MapaSprite.destroy();
        this.MapaSprite = null;
    }
    if (this.FotografiaSprite) {
        this.FotografiaSprite.destroy();
        this.FotografiaSprite = null;
    }
    if (this.PedraSprite) {
        this.PedraSprite.destroy();
        this.PedraSprite = null;
    }
    if (this.NotebookSprite) {
        this.NotebookSprite.destroy();
        this.NotebookSprite = null;
    }
    if (this.CameraSprite) {
        this.CameraSprite.destroy();
        this.CameraSprite = null;
    }

    // Canetas e marca-páginas (adicionar esses arrays no constructor)
    this.clearCanetas();
    this.clearMarcadores();
}

clearCanetas() {
    if (this.canetasSprites) {
        this.canetasSprites.forEach(caneta => {
            if (caneta.sprite) caneta.sprite.destroy();
            if (caneta.zone) caneta.zone.destroy();
        });
        this.canetasSprites = [];
    }
}

clearMarcadores() {
    if (this.marcadoresSprites) {
        this.marcadoresSprites.forEach(marcador => {
            if (marcador.sprite) marcador.sprite.destroy();
            if (marcador.zone) marcador.zone.destroy();
        });
        this.marcadoresSprites = [];
    }
}

    removeHitboxForObject(obj) {
        // Encontra a zona correspondente ao objeto clicado
        const zoneIndex = this.roomManager.interactiveZones.findIndex(zone =>
            Math.abs(zone.x - obj.x) < 5 && // Margem de erro para posição
            Math.abs(zone.y - obj.y) < 5 &&
            zone.width === obj.width &&
            zone.height === obj.height
        );

        if (zoneIndex !== -1) {
            const zone = this.roomManager.interactiveZones[zoneIndex];

            // 1. Remove a interatividade
            zone.disableInteractive();

            // 2. Remove da lista de zonas
            this.roomManager.interactiveZones.splice(zoneIndex, 1);

            // 4. Destrói completamente após animação
            zone.destroy();

            // 5. Marca como coletado no mapa (opcional)
            const mapData = this.cache.json.get(this.currentMapKey);
            mapData.layers.forEach(layer => {
                if (layer.type === 'objectgroup') {
                    layer.objects = layer.objects.filter(mapObj =>
                        mapObj.name !== obj.name ||
                        mapObj.x !== obj.x ||
                        mapObj.y !== obj.y
                    );
                }
            });
        }
    }

    showTextBoxWithChoices(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        
        // Mostra o botão "Abrir" apenas se for a gaveta E o mapa foi alterado
        if (this.lastClickedObject.name === "gavetaGrande") {
            // Só mostra "Abrir" se o mapa foi alterado
            this.buttonOpen.setVisible(this.gameState.mapaAlterado);
        } else {
            // Para outros objetos, mostra normalmente
            this.buttonOpen.setVisible(true);
        }
        this.buttonClose.setVisible(true);
    }

    showTextBoxDialogue(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonCloseDialogue.setVisible(true);

        this.buttonOpen.setVisible(false);
        this.buttonClose.setVisible(false);
    }

    //=========================================================================================================

    hideTextBox() {
    this.textBox.setVisible(false);
    this.textBoxBackground.setVisible(false);
    this.buttonOpen.setVisible(false);
    this.buttonClose.setVisible(false);
    this.buttonCloseDialogue.setVisible(false);
}

    //=========================================================================================================

    showItemZoom(itemKey, description = '') {
    if (this.zoomView.active) return;

    this.arrows.left.setVisible(false);
    this.arrows.right.setVisible(false);
    this.inventory.toggleInventory();

    // Ativa o estado de zoom
    this.zoomView.active = true;
    this.zoomView.currentItem = itemKey;

    // Cria um overlay escuro semi-transparente
    this.zoomView.overlay = this.add.rectangle(
        0, 0,
        this.cameras.main.width * 2, this.cameras.main.height * 2,
        0x000000,
        0.8
    )
        .setOrigin(0)
        .setDepth(1000)
        .setInteractive();

    // Cria uma cópia borrada do fundo atual
    this.zoomView.blurBg = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        this.bg.texture.key
    )
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setAlpha(0.1)
        .setDepth(1001)
        .setBlendMode(Phaser.BlendModes.OVERLAY);

    // Container para organizar os elementos do zoom
    this.zoomView.container = this.add.container(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50 // Move o container um pouco para cima para dar espaço à descrição
    ).setDepth(1002);

    // Adiciona o item em grande escala
    const itemHeight = this.cameras.main.height * 0.5; // Reduz um pouco o tamanho para caber a descrição
    this.zoomView.zoomedItem = this.add.image(0, 0, itemKey)
        .setDisplaySize(itemHeight * 0.7, itemHeight)
        .setInteractive()
        .on('pointerdown', () => {
            if (description) {
                this.showItemDescription(description);
            }
        });
    
    this.zoomView.container.add(this.zoomView.zoomedItem);

    // Botão de fechar
    this.zoomView.closeButton = this.add.text(
        this.cameras.main.centerX + 150,
        this.cameras.main.centerY - 250, // Move o botão mais para cima
        '[Fechar]',
        {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            resolution: 3
        }
    )
    .setDepth(1003)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', (e) => {
        e.stopPropagation();
        this.closeItemZoom();
    });

    // Fecha somente ao clicar no overlay
    this.zoomView.overlay.on('pointerdown', (pointer) => {
        if (!this.zoomView.zoomedItem.getBounds().contains(pointer.x, pointer.y)) {
            this.closeItemZoom();
        }
    });

    // Desativa interações com o jogo principal
    this.setInteractionsEnabled(false);
    
    // Mostra a descrição imediatamente se fornecida
    if (description) {
        this.showItemDescription(description);
    }
}

showItemDescription(text) {
    // Remove descrição anterior se existir
    if (this.zoomView.description) {
        this.zoomView.description.destroy();
    }

    // Calcula a posição Y abaixo do item (com margem de 20px)
    const itemBounds = this.zoomView.zoomedItem.getBounds();
    let descY = itemBounds.bottom + 20;
    
    // Calcula a largura máxima disponível (90% da tela)
    const maxWidth = this.cameras.main.width * 0.9;
    
    // Cria o texto de descrição
    this.zoomView.description = this.add.text(
        this.cameras.main.centerX, // Centraliza horizontalmente
        descY,
        text,
        {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            resolution: 3,
            wordWrap: { width: maxWidth },
            align: 'center' // Centraliza o texto
        }
    )
    .setOrigin(0.5, 0) // Ancora no centro-topo
    .setDepth(1004);
    
    // Verifica se a descrição está saindo da tela e ajusta se necessário
    const descBounds = this.zoomView.description.getBounds();
    if (descBounds.bottom > this.cameras.main.height) {
        // Se estiver saindo pela parte inferior, reduz o tamanho da fonte
        let newFontSize = 8;
        this.zoomView.description.setFontSize(newFontSize + 'px');
        
        // Recalcula a posição após ajustar o tamanho
        const newDescBounds = this.zoomView.description.getBounds();
        if (newDescBounds.bottom > this.cameras.main.height) {
            // Se ainda estiver saindo, move para cima
            const overflow = newDescBounds.bottom - this.cameras.main.height;
            this.zoomView.description.setY(this.zoomView.description.y - overflow - 10);
        }
    }
}

closeItemZoom() {
    if (!this.zoomView.active) return;

    // Remove todos os elementos do zoom
    this.zoomView.overlay.destroy();
    if (this.zoomView.blurBg) this.zoomView.blurBg.destroy();
    if (this.zoomView.closeButton) this.zoomView.closeButton.destroy();
    if (this.zoomView.container) this.zoomView.container.destroy();
    
    // Adicione esta linha para destruir explicitamente a imagem ampliada
    if (this.zoomView.zoomedItem) this.zoomView.zoomedItem.destroy();

    // Limpa a descrição se existir
    if (this.zoomView.description) {
        this.zoomView.description.destroy();
    }

    // Reseta o objeto zoomView
    this.zoomView = {
        active: false,
        currentItem: null,
        overlay: null,
        blurBg: null,
        closeButton: null,
        container: null,
        zoomedItem: null,
        description: null
    };

    // Restaura a UI
    this.arrows.left.setVisible(true);
    this.arrows.right.setVisible(true);

    // Reativa interações com o jogo principal
    this.setInteractionsEnabled(true);
}

showZoomedImage(imageKey, options = {}) {
    if (this.zoomView.active) return;

    // Configurações padrão
    const config = {
        x: this.cameras.main.centerX,
        y: this.cameras.main.centerY,
        closeButton: true,
        blurBackground: true,
        overlayAlpha: 0.8,
        targetWidth: 238,  // Largura desejada
        targetHeight: 244, // Altura desejada
        maxDisplayWidth: this.cameras.main.width * 0.8, // Máximo 80% da largura da tela
        maxDisplayHeight: this.cameras.main.height * 0.8, // Máximo 80% da altura da tela
        ...options
    };

    this.arrows.left.setVisible(false);
    this.arrows.right.setVisible(false);
    this.inventory.toggleInventory();

    // Ativa o estado de zoom
    this.zoomView.active = true;
    this.zoomView.currentItem = imageKey;

    // Cria um overlay escuro semi-transparente
    this.zoomView.overlay = this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        config.overlayAlpha
    ).setDepth(1000).setInteractive();

    // Cria uma cópia borrada do fundo atual se necessário
    if (config.blurBackground && this.bg) {
        this.zoomView.blurBg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.bg.texture.key
        )
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setAlpha(0.1)
            .setDepth(1001)
            .setBlendMode(Phaser.BlendModes.OVERLAY);
    }

    // Calcula o tamanho de exibição mantendo a proporção
    const originalRatio = config.targetWidth / config.targetHeight;
    let displayWidth = config.targetWidth;
    let displayHeight = config.targetHeight;

    // Ajusta se exceder os limites máximos
    if (displayWidth > config.maxDisplayWidth) {
        displayWidth = config.maxDisplayWidth;
        displayHeight = displayWidth / originalRatio;
    }

    if (displayHeight > config.maxDisplayHeight) {
        displayHeight = config.maxDisplayHeight;
        displayWidth = displayHeight * originalRatio;
    }

    // Adiciona a imagem com o tamanho calculado
    this.zoomView.zoomedItem = this.add.image(
        config.x,
        config.y,
        imageKey
    )
        .setDisplaySize(displayWidth, displayHeight)
        .setDepth(1002);

    // Fecha ao clicar no overlay
    this.zoomView.overlay.on('pointerdown', () => {
        this.closeItemZoom();
    });

    // Desativa interações com o jogo principal
    this.setInteractionsEnabled(false);
}

    //=========================================================================================================
}   