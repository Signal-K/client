import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import styles from '../../../styles/Home.module.css';

interface CustomMediaProps {
    src: string;
    alt: string;
    metadata: {
      title: string;
      description: string;
    };
};

const CustomMediaRenderer: React.FC<CustomMediaProps> = ({
    src,
    alt,
    metadata,
  }) => {
    return (
      <div style={{ position: "relative", width: "64", height: "64" }}>
        <img
          src={src}
          alt={alt}
          style={{
            objectFit: "contain",
            width: "64",
            height: "64",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: "bold" }}>{metadata.title}</div>
          <div>{metadata.description}</div>
        </div>
      </div>
    );
};

export function InventoryMenu({ setActiveTab }) {
    const tabs = [
        { label: 'CONSUMABLES', id: 'consumables' },
        { label: 'WEAPONS', id: 'weapons' },
        { label: 'SPACE SUITS', id: 'spaceSuits' },
        { label: 'RESOURCES', id: 'resources' },
        { label: 'SPACE CRAFT', id: 'spaceCraft' },
        { label: 'CRAFTING', id: 'crafting' },
        { label: 'BUILDINGS', id: 'buildings' },
    ];

    const [activeTab, setActiveTabInternal] = useState('consumables');

    const handleTabClick = (tabId) => {
      setActiveTabInternal(tabId);
      setActiveTab(tabId);
    };

    return (
        <div className="w-[1749px] h-[97px] p-5 justify-start items-center gap-[30px] inline-flex">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-5 py-3.5 ${
                activeTab === tab.id
                  ? 'bg-black bg-opacity-5 rounded-[10px]'
                  : 'bg-opacity-0'
              } flex-col justify-center items-center gap-[4.75px] inline-flex cursor-pointer`}
            >
              <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
                {tab.label}
              </div>
            </div>
          ))}
        </div>
      );
};

export function SelectedItem() {
    return (
        <div className="w-[235px] h-[792px] px-2.5 py-5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-2.5 inline-flex">
    <div className="h-[267px] relative">
        <div className="w-[215px] h-12 left-0 top-0 absolute justify-center items-center inline-flex">
            <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
                <div className="self-stretch text-center text-emerald-300 text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">Selected item</div>
            </div>
        </div>
        <div className="w-[215px] h-[215px] px-2.5 py-5 left-0 top-[52px] absolute justify-center items-start inline-flex">
            <div className="w-[175px] h-[175px] bg-white bg-opacity-20 rounded-[15px] justify-center items-center gap-2.5 flex">
                <div className="text-center text-white text-base font-bold font-['Inter'] uppercase tracking-[2.56px]">IMAGE</div>
            </div>
        </div>
    </div>
    <div className="self-stretch grow shrink basis-0 flex-col justify-start items-center gap-4 flex">
        <div className="self-stretch h-9 py-1.5 flex-col justify-center items-center gap-[4.75px] flex">
            <div className="self-stretch text-center text-white text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">iTEM sTATS</div>
        </div>
        <div className="h-[105px] relative">
            <div className="w-[215px] h-[52px] px-4 py-3.5 left-0 top-0 absolute border-b border-neutral-400 justify-between items-center inline-flex">
                <div className="text-center text-white text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">quantity:</div>
                <div className="grow shrink basis-0 text-right text-emerald-300 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">4</div>
            </div>
            <div className="w-[215px] h-[52px] px-4 py-3.5 left-0 top-[53px] absolute border-b border-neutral-400 justify-between items-center inline-flex">
                <div className="text-center text-white text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">Rarity:</div>
                <div className="grow shrink basis-0 text-right text-purple-500 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">epic</div>
            </div>
        </div>
    </div>
</div>
    );
};

export function UserBackpackInventory() {
    return (
        <div className="w-[472px] h-[792px] px-5 pt-5 pb-1.5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-7 inline-flex">
    <div className="w-[215px] justify-center items-center inline-flex">
        <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="self-stretch text-center text-white text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">BACKPACK</div>
        </div>
    </div>
    <div className="w-[432px] justify-center items-center gap-[30px] inline-flex">
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
        <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
            <div className="text-center text-white text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">nO ITEM</div>
            <div className="w-[100px] h-[100px] bg-white bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
        </div>
    </div>
</div>
    );
};

// This will show the items of "tool" type that you own that you can equip
export function OwnedToolItems() {
    const supabase = useSupabaseClient();
    const session = useSession();

    // Item configuration -> will pull from supabase later
    const customMediaProps = {
        src: "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/8b09080f-1306-4ca7-b3b4-b284f047669e.png",
        alt: "Description of your image",
        metadata: {
          title: "Image Title",
          description: "Description of the image",
        },
    };

    return (
        <>
            <div className={styles.gameplayBoxGrid}>
                <div className={styles.gameplayBox} key="">
                    <CustomMediaRenderer {...customMediaProps} />
                    <h3>Name of object</h3>
                    <div className={styles.smallMargin}>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Button</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export function EquippedToolItems() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const customMediaProps = {
        src: "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/8b09080f-1306-4ca7-b3b4-b284f047669e.png",
        alt: "Description of your image",
        metadata: {
          title: "Image Title",
          description: "Description of the image",
        },
    };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 className={`${styles.npGapTop}`}>Equipped tools</h2>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                }}
            >
                <div style={{ outline: "1px solid grey", borderRadius: 16 }}>
                    <CustomMediaRenderer {...customMediaProps} />
                </div>
                <div style={{ outline: "1px solid grey", borderRadius: 16, marginLeft: 8 }}>
                    <CustomMediaRenderer {...customMediaProps} />
                </div>
            </div>
        </div>
    )
}

export default function InventoryItemsGroup() {
  return (
    <div className="w-[1789px] h-[1076.03px] flex-col justify-center items-center gap-[60px] inline-flex">
      <div className="w-[946px] h-[67.03px] flex-col justify-center items-center flex">
        <div className="text-center text-gray-200 text-[66.67px] font-normal font-['Anonymous Pro'] tracking-[21.33px]">
          INVENTORY
        </div>
        <div className="w-[946px] h-[0px] border-4 border-gray-400"></div>
      </div>
      <div className="px-5 bg-black bg-opacity-40 rounded-[15px] justify-center items-center gap-2.5 inline-flex">
        <div className="p-5 justify-start items-center gap-[30px] flex">
          <div className="px-5 py-3.5 bg-black bg-opacity-5 rounded-[10px] flex-col justify-center items-start gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              CONSUMABLES
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              wEAPONS
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              sPACE SUITS
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              rESOURCES
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              sPACE cRAFT
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              cRAFTING
            </div>
          </div>
          <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
            <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">
              bUILDINGS
            </div>
          </div>
        </div>
      </div>
      <div className="justify-center items-center gap-[122px] inline-flex">
        <div className="h-[792px] px-2.5 py-5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-2.5 inline-flex">
          <div className="h-[267px] relative">
            <div className="w-[215px] h-12 left-0 top-0 absolute justify-center items-center inline-flex">
              <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
                <div className="self-stretch text-center text-emerald-300 text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                  Selected item
                </div>
              </div>
            </div>
            <div className="w-[215px] h-[215px] px-2.5 py-5 left-0 top-[52px] absolute justify-center items-start inline-flex">
              <div className="w-[175px] h-[175px] bg-black bg-opacity-20 rounded-[15px] justify-center items-center gap-2.5 flex">
                <div className="text-center text-black text-base font-bold font-['Inter'] uppercase tracking-[2.56px]">
                  IMAGE
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch grow shrink basis-0 flex-col justify-start items-center gap-4 flex">
            <div className="self-stretch h-9 py-1.5 flex-col justify-center items-center gap-[4.75px] flex">
              <div className="self-stretch text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                iTEM sTATS
              </div>
            </div>
            <div className="h-[105px] relative">
              <div className="w-[215px] h-[52px] px-4 py-3.5 left-0 top-0 absolute border-b border-neutral-400 justify-between items-center inline-flex">
                <div className="text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                  quantity:
                </div>
                <div className="grow shrink basis-0 text-right text-emerald-300 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                  4
                </div>
              </div>
              <div className="w-[215px] h-[52px] px-4 py-3.5 left-0 top-[53px] absolute border-b border-neutral-400 justify-between items-center inline-flex">
                <div className="text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                  Rarity:
                </div>
                <div className="grow shrink basis-0 text-right text-purple-500 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                  epic
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="justify-center items-center gap-10 flex">
          <div className="h-[792px] px-5 pt-5 pb-1.5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-7 inline-flex">
            <div className="w-[215px] justify-center items-center inline-flex">
              <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
                <div className="self-stretch text-center text-black text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                  BACKPACK
                </div>
              </div>
            </div>
            <div className="w-[432px] justify-center items-center gap-[30px] inline-flex">
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
            </div>
          </div>
          <div className="w-[51px] h-[51px] relative origin-top-left rotate-90 bg-black bg-opacity-40 rounded-[10px]" />
          <div className="h-[792px] px-5 pt-5 pb-1.5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-7 inline-flex">
            <div className="w-[215px] justify-center items-center inline-flex">
              <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
                <div className="self-stretch text-center text-black text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                  SPACESHIP
                </div>
              </div>
            </div>
            <div className="w-[432px] justify-center items-center gap-[30px] inline-flex">
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
              <div className="p-3 flex-col justify-center items-center gap-2.5 inline-flex">
                <div className="text-center text-black text-base font-medium font-['Inter'] uppercase tracking-[2.56px]">
                  nO ITEM
                </div>
                <div className="w-[100px] h-[100px] bg-black bg-opacity-5 rounded-[15px] justify-center items-center gap-2.5 inline-flex" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-[792px] px-2.5 py-5 bg-black bg-opacity-40 rounded-[15px] flex-col justify-start items-center gap-2.5 inline-flex">
          <div className="h-[267px] relative">
            <div className="w-[215px] h-12 left-0 top-0 absolute justify-center items-center inline-flex">
              <div className="grow shrink basis-0 px-5 flex-col justify-center items-center gap-[4.75px] inline-flex">
                <div className="self-stretch text-center text-sky-400 text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                  users cHARCTER
                </div>
              </div>
            </div>
            <div className="w-[215px] h-[215px] px-2.5 py-5 left-0 top-[52px] absolute justify-center items-start inline-flex">
              <div className="w-[175px] h-[175px] bg-black bg-opacity-20 rounded-[15px] justify-center items-center gap-2.5 flex">
                <div className="text-center text-black text-base font-bold font-['Inter'] uppercase tracking-[2.56px]">
                  IMAGE
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch grow shrink basis-0 flex-col justify-start items-center gap-4 flex">
            <div className="self-stretch h-9 py-1.5 flex-col justify-center items-center gap-[4.75px] flex">
              <div className="self-stretch text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                PLAYER sTATS
              </div>
            </div>
            <div className="self-stretch px-[42px] py-3.5 bg-sky-400 bg-opacity-50 rounded-[15px] border-b border-neutral-400 justify-between items-center inline-flex">
              <div className="text-center text-black text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                lvl:
              </div>
              <div className="text-right text-black text-xl font-bold font-['Inter'] uppercase tracking-[3.20px]">
                12
              </div>
            </div>
            <div className="w-[215px] px-[42px] py-3.5 border-b border-neutral-400 justify-between items-center inline-flex">
              <div className="text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                atk:
              </div>
              <div className="text-right text-sky-400 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                32
              </div>
            </div>
            <div className="w-[215px] px-[42px] py-3.5 border-b border-neutral-400 justify-between items-center inline-flex">
              <div className="text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                def:
              </div>
              <div className="text-right text-sky-400 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                11
              </div>
            </div>
            <div className="w-[215px] px-[42px] py-3.5 border-b border-neutral-400 justify-between items-center inline-flex">
              <div className="text-center text-black text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                eND:
              </div>
              <div className="text-right text-sky-400 text-xl font-medium font-['Inter'] uppercase tracking-[3.20px]">
                18
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};