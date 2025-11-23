# sponsors_config.py

SPONSORS = {
    "Sidi Ali": {
        "category": "Beverage",
        "context_triggers": ["hot_weather", "halftime"],
        "zones": ["all"],
        "message": "Restez hydraté avec Sidi Ali !"
    },
    "Coca-Cola": {
        "category": "Beverage",
        "context_triggers": ["goal", "halftime", "excited_crowd"],
        "zones": ["all"],
        "message": "Savourez l'instant Coca-Cola !"
    },
    "Orange": {
        "category": "Telecom",
        "context_triggers": ["halftime", "pre_match", "post_match"],
        "zones": ["all"],
        "message": "Partagez vos moments forts avec la 5G Orange."
    },
    "Inwi": {
        "category": "Telecom",
        "context_triggers": ["halftime", "bored_crowd"],
        "zones": ["North", "South", "East"],
        "message": "Le meilleur réseau pour vos stories."
    },
    "Puma": {
        "category": "Apparel",
        "context_triggers": ["goal", "star_player_action"],
        "zones": ["all"],
        "message": "Puma : Forever Faster."
    },
    "Adidas": {
        "category": "Apparel",
        "context_triggers": ["goal", "penalty"],
        "zones": ["all"],
        "message": "Impossible is Nothing."
    },
    "Royal Air Maroc": {
        "category": "Travel",
        "context_triggers": ["pre_match", "post_match", "vip_presence"],
        "zones": ["VIP", "West"],
        "message": "Envolez-vous vers vos rêves avec RAM."
    },
    "OCP": {
        "category": "Institutional",
        "context_triggers": ["pre_match", "calm_game"],
        "zones": ["VIP", "West"],
        "message": "OCP : Nourrir la planète."
    },
    "Koutoubia": {
        "category": "Food",
        "context_triggers": ["halftime", "hungry_time"], # hungry_time = around 19:00-21:00
        "zones": ["North", "South", "East"],
        "message": "Le goût de la tradition."
    },
    "CDG": {
        "category": "Banking",
        "context_triggers": ["pre_match"],
        "zones": ["VIP"],
        "message": "CDG : L'avenir se construit aujourd'hui."
    },
    "Hyundai": {
        "category": "Automotive",
        "context_triggers": ["goal", "fast_play"],
        "zones": ["all"],
        "message": "Hyundai : En route vers la victoire."
    },
    "Visa": {
        "category": "Finance",
        "context_triggers": ["ticket_sales", "merch_stand"],
        "zones": ["all"],
        "message": "Payez en toute simplicité avec Visa."
    }
}

# Helper to get sponsor list
SPONSOR_NAMES = list(SPONSORS.keys())
