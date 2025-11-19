// src/services/teilnehmerService.js
export const teilnehmerService = {
    async getProfile(success, error) {
        try {
            // TODO: echten API-Call
            const data = {
                teilnehmer: {
                    abotage: 0,
                    essenabotyp: 0
                }
            };
            success && success(data);
        } catch (e) {
            error && error(e);
        }
    },

    refresh() {
        // ggf. profil neu laden – TODO
    },

    clearProfileData() {
        // Profilcache leeren – TODO
    }
};
