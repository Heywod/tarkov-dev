import { useRef, useMemo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Connect from './Connect.jsx';

import ammoData from '../../data/ammo.json';
import mapData from '../../data/maps.json';

import './index.css';
import { useItemsQuery } from '../../features/items/queries.js';

const ammoTypes = [
    ...new Set(
        ammoData.data.map((ammoData) => {
            return ammoData.type;
        }),
    ),
].sort();

const selectFilterStyle = {
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#2d2d2f',
        border: '2px solid #9a8866',
        borderRadius: 0,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: '#2d2d2f',
        border: '2px solid #9a8866',
        borderRadius: 0,
    }),
    menuList: (provided) => ({
        ...provided,
        color: '#E5E5E5',
        borderRadius: 0,
    }),
    option: (provided) => ({
        ...provided,
        color: '#E5E5E5',
        backgroundColor: '#2d2d2f',

        borderRadius: 0,
        '&:hover': {
            backgroundColor: '#9a8866',
            color: '#2d2d2f',
            fontweight: 700,
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#c7c5b3',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#E5E5E5',
        color: '#E5E5E5',
    }),
};

function Control(props) {
    const { data: items } = useItemsQuery();

    const socketConnected = useSelector((state) => state.sockets.connected);
    const { t } = useTranslation();

    const itemList = useMemo(() => {
        return items
            .map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [items]);

    const typeRefs = {
        ammo: useRef(null),
        map: useRef(null),
        lootTier: useRef(null),
    };

    const handleMapChange = () => {
        handleViewChange('map', typeRefs['map'].current.value);
    };

    const handleAmmoChange = () => {
        const ammoValues = [];

        for (const option of typeRefs['ammo'].current.children) {
            if (!option.selected) {
                continue;
            }

            ammoValues.push(option.value);
        }

        ammoValues.sort();
        handleViewChange('ammo', ammoValues.join(','));
    };

    // const handleLootTierChange = () => {
    //     handleViewChange('loot-tier', typeRefs['lootTier'].current.value);
    // };

    const handleViewChange = (view, eventOrValue) => {
        let value = eventOrValue.target?.value || eventOrValue;

        if (!props.send) {
            return false;
        }

        props.send({
            type: 'command',
            data: {
                type: view,
                value: value,
            },
        });
    };

    const handleSelectChange = (event) => {
        handleViewChange('item', event.value);
    };

    return (
        <div className="control-wrapper" key="">
            <h1>{t('Remote Control')}</h1>
            <div className={'control-section'}>
                <span>{t('View map')}:</span>
                <select
                    disabled={!socketConnected}
                    name="map"
                    onChange={handleMapChange}
                    ref={typeRefs['map']}
                >
                    {mapData.map((map) => (
                        <option key={map.key} value={map.key}>
                            {map.displayText}
                        </option>
                    ))}
                </select>
                <button disabled={!socketConnected} onClick={handleMapChange}>
                    {t('Go')}
                </button>
            </div>
            <div className={'control-section'}>
                <span>{t('View caliber')}:</span>
                <select
                    disabled={!socketConnected}
                    multiple
                    name="ammo"
                    onChange={handleAmmoChange}
                    ref={typeRefs['ammo']}
                >
                    {ammoTypes.map((ammoType) => (
                        <option key={ammoType} value={ammoType}>
                            {ammoType}
                        </option>
                    ))}
                </select>
                <button disabled={!socketConnected} onClick={handleAmmoChange}>
                    {t('Go')}
                </button>
            </div>
            <Select
                // defaultValue = {defaultValue}
                // isMulti = {isMulti}
                isDisabled={!socketConnected}
                name="colors"
                options={itemList}
                className="basic-multi-select"
                onChange={handleSelectChange}
                classNamePrefix="select"
                // onMenuClose = {onMenuClose}
                // onMenuOpen = {onMenuOpen}
                styles={selectFilterStyle}
            />
            {/* <div
            className = {'control-section'}
        >
            <span>View loot tiers:</span>
            <select
                name="loot-tier"
                onChange={handleLootTierChange}
                ref = {typeRefs['lootTier']}
            >
                <option
                    value = 'grid-items'
                >
                    {'Barter items'}
                </option>
                <option
                    value = 'mods'
                >
                    {'Mods'}
                </option>
                <option
                    value = 'keys'
                >
                    {'Keys'}
                </option>
            </select>
            <button
                onClick = {handleLootTierChange}
            >
                Go
            </button>
        </div> */}
            <div className="info-wrapper">
                {t(
                    'Load tarkov.dev in another browser or window to control it from here',
                )}
            </div>
            <Connect />
        </div>
    );
}

export default Control;
