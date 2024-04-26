import { world, system } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";

export class until {
    static timeout(timenum) {
        return new Promise((resolve) => {
            system.runTimeout(() => {
                resolve();
            }, 20 * timenum);
        });
    };

    static formbusy(player,form){
        return new Promise(res => {
            system.run(async function run(){
                const response = await form.show(player);
                const {canceled, cancelationReason: reason} = response;
                if(canceled && reason === UI.FormCancelationReason.UserBusy) return system.run(run);
                res(response);
            });
        });
    };
};