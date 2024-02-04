import pandas as pd
pd.set_option('display.max_rows',None)
lieuxPublics = pd.read_csv('lieux-fr.csv')
lieuxPrivés = pd.read_csv('occupation-commerciale-2023.csv')
print(lieuxPrivés.info())
def getPharmacies():
    print(len(lieuxPrivés))
    pharmacies = lieuxPrivés[lieuxPrivés['ID_USAGE3']==103]
    pharmacies.to_csv('pharmacies.csv')
    return pharmacies

def getParc():
    parc = lieuxPublics.loc[lieuxPublics['installations']=='Parc']
    parcChiens = lieuxPublics.loc[lieuxPublics['installations']=='Parc à chiens']
    return parc.append(parcChiens, ignore_index=True)
types = lieuxPublics['installations'].value_counts()
typesPrivates = lieuxPrivés['USAGE3'].value_counts()
print(types)
print(str(typesPrivates))
#getParc().to_csv('parcs.csv')


def getGroceries():
    epicerie = lieuxPrivés.loc[lieuxPrivés['USAGE3']=='Épicerie']
    supermarche = lieuxPrivés.loc[lieuxPrivés['USAGE3']=='Supermarché']
    epicerieSpecialise = lieuxPrivés.loc[lieuxPrivés['USAGE3']=='Épicerie spécialisée']
    eps = epicerie.append(epicerieSpecialise, ignore_index=True)
    all_groceries = eps.append(supermarche,ignore_index =True)
    return all_groceries
#print(getGroceries())
#getGroceries().to_csv('groceries.csv')

def getCommunity():
    biblio = lieuxPublics[lieuxPublics['installations']=='Bibliothèque']
    communautaire =   lieuxPublics[lieuxPublics['installations']=='Centre Communautaire']
    culturel = lieuxPublics[lieuxPublics['installations']=='Centre culturel']
    centres = culturel.append(communautaire, ignore_index=True)
    communityCenters = centres.append(biblio,ignore_index =True)
    return communityCenters


getCommunity().to_csv('communityCenters.csv')
