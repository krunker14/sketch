import { AimbotMenu } from "../cheats/aimbot";
import sketchConfig, { useSketchConfig } from "../sketchConfig";
import { BindHolder, Bind } from "../krunker-ui/components/Bind";
import { Set } from "../krunker-ui/components/Set";
import { Switch } from "../krunker-ui/components/Switch";
import { Settings, Tab } from "../krunker-ui/settings";

declare global {
  // present on editor.html
  interface KrunkerEditor {
    importMap(data: string): void;
    skipTempPop: boolean;
  }

  interface Window {
    showWindow(i: number): void;
    closeWindow(): void;
    KE: KrunkerEditor;
  }
}

let defaultTabID: number | undefined;

const tabs: Tab[] = [
  {
    name: "Menu",
    body: () => {
      const [menuKey, setMenuKey] = useSketchConfig("menuKey");
      const [menuButton] = useSketchConfig("menuButton");
      const [silentFail, setSilentFail] = useSketchConfig("silentFail");

      return (
        <Set title="Menu">
          <BindHolder title="Menu Key">
            <Bind
              bind={menuKey}
              setBind={(bind) => {
                if (bind === 10001) alert("Invalid bind");
                else setMenuKey(bind);
              }}
              reset={() => setMenuKey()}
              unbind={() => setMenuKey(-1)}
            />
          </BindHolder>
          <Switch
            title="Menu Button"
            defaultChecked={menuButton}
            attention
            description="Will require reloading the page if you are enabling the menu button after a reload."
            onChange={(event) => {
              if (menuKey === -1) {
                event.currentTarget.checked = false;
                alert(
                  "You must set a menu keybind before disabling the button",
                );
              } else {
                sketchConfig.set("menuButton", event.currentTarget.checked);
              }
            }}
          />
          <Switch
            title="Streamer Mode"
            description="When enabled, the cheat will silently fail if there's an update, the access key expires, or the cheat isn't updated."
            defaultChecked={silentFail}
            onChange={(event) => {
              if (
                !silentFail &&
                !confirm(
                  "Enabling this setting will require you to follow the Sketch guide to disable it if there's an update, the access key expires, or the cheat isn't updated. Proceed?",
                )
              )
                event.currentTarget.checked = false;
              setSilentFail(event.currentTarget.checked);
            }}
          />
        </Set>
      );
    },
  },
  {
    name: "Combat",
    body: () => {
      return <AimbotMenu />;
    },
  },
];

export default function Menu() {
  return (
    <Settings
      defaultTabID={defaultTabID}
      onTabChange={(tabID) => {
        defaultTabID = tabID;
      }}
      header={
        <div
          style={{
            color: "white",
            textAlign: "center",
            padding: "30px 0",
          }}
        >
          Sketch
        </div>
      }
      tabs={tabs}
    />
  );
}
