import React from "react";

export function InventoryMenu() {
    return (
    <div className="w-[1749px] h-[97px] p-5 justify-start items-center gap-[30px] inline-flex">
    <div className="px-5 py-3.5 bg-black bg-opacity-5 rounded-[10px] flex-col justify-center items-start gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">CONSUMABLES</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">wEAPONS</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">sPACE SUITS</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">rESOURCES</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">sPACE cRAFT</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">cRAFTING</div>
    </div>
    <div className="px-5 py-3.5 flex-col justify-center items-center gap-[4.75px] inline-flex">
        <div className="text-center text-black text-2xl font-medium font-['Inter'] uppercase tracking-[3.84px]">bUILDINGS</div>
    </div>
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