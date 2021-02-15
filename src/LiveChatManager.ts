import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import LiveChatController from './controllers/LiveChatController';
import ILiveChatSubscriber from './services/interfaces/ILiveChatSubscriber';
import ILiveChatPublisher from './services/interfaces/ILiveChatPublisher';
import ScrapingLiveChatPublisher from './services/ScrapingLiveChatPublisher';
import ICommandSubscriber from './services/interfaces/ICommandSubscriber';
import LocalIOController from './controllers/LocalIOController';
import WebHookController from './controllers/WebHookController';
import ICommandPublisher from './services/interfaces/ICommandPublisher';
import LocalIOPublisher from './services/LocalIOPublisher';
import RobotJSIOController from './services/RobotJSIOController';
import LiveChatAdapter from './services/LiveChatAdapter';
import {
  CommandConfig,
  Configs,
  KeywordConfig,
  loadCommandConfig,
  readConfig,
} from './utils/loadConfig';
import LiveChatCustomCommandAdapter from './services/LiveChatCustomCommandAdapter';
import IMacroPlayer from './services/interfaces/IMacroPlayer';
import MacroManager from './services/MacroManager';
import DiscordChatPublisher from './services/DiscordChatPublisher';
import TwitchChatPublisher from './services/TwitchChatPublisher';
import YoutubeApiLiveChatPublisher from './services/YoutubeApiLiveChatPublisher';
import WebServerController from './controllers/WebServerController';
import LiveChatReplaceAdapter from './services/LiveChatReplaceAdapter';
import PoolCommandAdapter from './services/PoolCommandAdapter';
import { Settings, writeConfig } from './utils/ConfigWriter';

export default class LiveChatManager {
  private sourcePath: string;

  private commandPath: string;

  private mainWindow: BrowserWindow;

  private source!: Configs;

  private commandConfig!: CommandConfig;

  private webServer!: WebServerController;

  private ioController!: RobotJSIOController;

  private localController!: ICommandSubscriber;

  private macroController!: IMacroPlayer;

  private chatSubscriber!: ILiveChatSubscriber;

  private webHookSubscriber!: ILiveChatSubscriber;

  private ioPublisher!: ICommandPublisher;

  private discordPublisher!: ILiveChatPublisher;

  private twitchPublisher!: ILiveChatPublisher;
  
  private youtubePublisher!: ILiveChatPublisher;

  public constructor(
    sourceConfigPath: string,
    commandConfigPath: string,
    mainWindow: BrowserWindow
  ) {
    this.sourcePath = sourceConfigPath;
    this.commandPath = commandConfigPath;
    this.mainWindow = mainWindow;

    this.loadConfig();
    this.init();
  }

  private loadConfig() {
    this.source = readConfig(this.sourcePath);
    this.commandConfig = loadCommandConfig(this.commandPath);
  }

  public start(): void {
    const allowList: boolean[] = [
      this.source.youtube.allow,
      this.source.discord.allow,
      this.source.twitch.allow,
    ];

    const publishers: ILiveChatPublisher[] = [
      this.youtubePublisher,
      this.discordPublisher,
      this.twitchPublisher,
    ];

    for (let i = 0; i < publishers.length; i++) {
      if (!allowList[i]) continue;
      const publisher = publishers[i];

      publisher.register(this.chatSubscriber);
      if (this.source.webhooks.allow)
        publisher.register(this.webHookSubscriber);

      publisher.start();
    }
  }

  private init(): void {
    this.createWebServer();
    this.createAdminControllers();
    this.createSubscribers();
    this.createPublishers();
    this.createAdapters();
    this.startAdminController();

    ipcMain.removeAllListeners('settings:get');
    ipcMain.removeAllListeners('settings:save');
    ipcMain.on('settings:get', (event: IpcMainEvent) => {
      event.returnValue = {
        sources: this.source,
        commands: this.commandConfig,
      };
    });

    ipcMain.on('settings:save', (_: IpcMainEvent, settings: Settings) => {
      writeConfig(this.sourcePath, this.commandPath, settings);
    });
  }

  private createWebServer() {
    this.webServer = WebServerController.getInstance(3000, this.mainWindow);
    this.webServer.start();
  }

  private createAdminControllers() {
    this.ioController = new RobotJSIOController();
    this.localController = new LocalIOController(this.ioController);
    this.macroController = MacroManager.getInstance();
  }

  private createSubscribers() {
    this.chatSubscriber = new LiveChatController(
      this.ioController,
      this.ioController,
      this.macroController
    );
    this.webHookSubscriber = new WebHookController(this.source.webhooks.urls);
  }

  private createPublishers() {
    this.ioPublisher = new LocalIOPublisher();
    this.discordPublisher = new DiscordChatPublisher(this.source.discord.token);
    this.twitchPublisher = new TwitchChatPublisher(this.source.twitch.channel);

    this.youtubePublisher = this.source.youtube.useAPI
      ? new YoutubeApiLiveChatPublisher(this.source.youtube)
      : new ScrapingLiveChatPublisher(this.source.youtube);
  }

  private startAdminController() {
    this.ioPublisher.register(this.localController);
    this.ioPublisher.start();
  }

  private createAdapters() {
    if (this.commandConfig.useOnlyDefined) {
      this.chatSubscriber = new LiveChatCustomCommandAdapter(
        this.chatSubscriber,
        this.commandConfig.commands
      );
      this.webHookSubscriber = new LiveChatCustomCommandAdapter(
        this.webHookSubscriber,
        this.commandConfig.commands
      );
    } else {
      this.chatSubscriber = new LiveChatAdapter(
        this.chatSubscriber,
        this.commandConfig.commands
      );
      this.webHookSubscriber = new LiveChatAdapter(
        this.webHookSubscriber,
        this.commandConfig.commands
      );
    }

    let poolCommands: KeywordConfig[] = this.commandConfig.commands;
    if (this.commandConfig.useReplace) {
      poolCommands = this.commandConfig.replaces;
      this.chatSubscriber = new LiveChatReplaceAdapter(
        this.chatSubscriber,
        this.commandConfig.replaces
      );
      this.webHookSubscriber = new LiveChatReplaceAdapter(
        this.webHookSubscriber,
        this.commandConfig.replaces
      );
    }

    if (this.commandConfig.usePool) {
      this.chatSubscriber = new PoolCommandAdapter(
        this.chatSubscriber,
        poolCommands,
        this.commandConfig.pool
      );
      this.webHookSubscriber = new PoolCommandAdapter(
        this.webHookSubscriber,
        poolCommands,
        this.commandConfig.pool
      );
    }
  }

  public close(): void {
    let allowList: boolean[] = [
      this.source.youtube.allow,
      this.source.discord.allow,
      this.source.twitch.allow,
    ];

    let publishers: ILiveChatPublisher[] = [
      this.youtubePublisher,
      this.discordPublisher,
      this.twitchPublisher,
    ];

    this.ioPublisher.stop();

    for (let i = 0; i < publishers.length; i++) {
      if (!allowList[i]) continue;
      const publisher = publishers[i];
      publisher.stop();
    }
  }

  public clear(): void {
    this.close();
    this.ioPublisher.stop();
    this.webServer.stop();

    ipcMain.removeAllListeners('settings:get');
    ipcMain.removeAllListeners('settings:save');
  }

  public reload(): void {
    this.clear();
    this.loadConfig();
    this.init();
    this.start();

    this.mainWindow.webContents.send('settings:received', {
      sources: this.source,
      commands: this.commandConfig,
    });
  }
}
