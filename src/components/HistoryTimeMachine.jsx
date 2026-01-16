import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPES & CONSTANTS
// ============================================

const HISTORICAL_PRESETS = [
  { label: 'Ides of March', date: { year: 44, month: 3, day: 15, hour: 11, isBCE: true } },
  { label: 'Moon Landing', date: { year: 1969, month: 7, day: 20, hour: 20, isBCE: false } },
  { label: 'Fall of Berlin Wall', date: { year: 1989, month: 11, day: 9, hour: 19, isBCE: false } },
  { label: 'Pompeii Eruption', date: { year: 79, month: 8, day: 24, hour: 13, isBCE: false } },
  { label: 'French Revolution', date: { year: 1789, month: 7, day: 14, hour: 10, isBCE: false } },
  { label: 'Columbus Arrives', date: { year: 1492, month: 10, day: 12, hour: 6, isBCE: false } },
];

const CATEGORY_CONFIG = {
  selected: { label: 'Highlights', icon: '⭐', color: 'amber' },
  events: { label: 'Events', icon: '📜', color: 'blue' },
  births: { label: 'Births', icon: '👶', color: 'green' },
  deaths: { label: 'Deaths', icon: '🕯️', color: 'gray' },
  holidays: { label: 'Holidays', icon: '🎉', color: 'purple' },
};

const PROVIDER_CONFIG = {
  // 🍌 NANO BANANA - The primary free tier image generation model
  nanobanana: { name: 'Nano Banana (Free Tier)', icon: '🍌', color: 'amber', keyType: 'gemini', model: 'gemini-2.5-flash-image' },
  // ✨ NANO BANANA PRO
  gemini3: { name: 'Nano Banana Pro', icon: '✨', color: 'purple', keyType: 'gemini', model: 'gemini-3-pro-image-preview' },
  // 🆓 POLLINATIONS - Backup free provider (unlimited)
  pollinations: { name: 'Pollinations (Backup)', icon: '🆓', color: 'emerald', keyType: null, model: 'flux' },
  // 🟢 DALL-E 3
  openai: { name: 'DALL-E 3', icon: '🟢', color: 'green', keyType: 'openai', model: 'dall-e-3' },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatCoordinate = (value, isLatitude) => {
  const absolute = Math.abs(value);
  const direction = isLatitude
    ? value >= 0 ? 'N' : 'S'
    : value >= 0 ? 'E' : 'W';
  return `${absolute.toFixed(4)}° ${direction}`;
};

const formatHistoricalDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[date.month - 1];
  const yearStr = date.isBCE ? `${date.year} BCE` : `${date.year} CE`;
  let dateStr = `${monthName} ${date.day}, ${yearStr}`;
  if (date.hour !== undefined) {
    dateStr += `, ${date.hour.toString().padStart(2, '0')}:00 hours`;
  }
  return dateStr;
};

const generatePrompt = (coordinates, date) => {
  const lat = formatCoordinate(coordinates.latitude, true);
  const lng = formatCoordinate(coordinates.longitude, false);
  const dateStr = formatHistoricalDate(date);
  return `Create an image at ${lat}, ${lng}, ${dateStr}. Photorealistic, street photography style.`;
};

const generateEventPrompt = (event, coordinates) => {
  let prompt = '';
  if (coordinates) {
    const lat = formatCoordinate(coordinates.latitude, true);
    const lng = formatCoordinate(coordinates.longitude, false);
    prompt += `Create an image at ${lat}, ${lng}, `;
  } else {
    prompt += 'Create an image depicting ';
  }
  if (event.year) {
    const yearStr = event.year < 0 ? `${Math.abs(event.year)} BCE` : `${event.year} CE`;
    prompt += `${yearStr}: `;
  }
  const shortText = event.text.length > 150 ? event.text.substring(0, 147) + '...' : event.text;
  prompt += shortText;
  prompt += ' Photorealistic, street photography style.';
  return prompt;
};

// ============================================
// API KEY STORAGE (localStorage)
// ============================================

const STORAGE_PREFIX = 'htm_apikey_';

const ApiKeyStorage = {
  saveKey: (keyType, apiKey) => {
    try {
      const encoded = btoa(apiKey);
      localStorage.setItem(`${STORAGE_PREFIX}${keyType}`, encoded);
    } catch (e) {
      console.error('Failed to save key:', e);
    }
  },
  getKey: (keyType) => {
    try {
      const encoded = localStorage.getItem(`${STORAGE_PREFIX}${keyType}`);
      if (!encoded) return null;
      return atob(encoded);
    } catch {
      return null;
    }
  },
  removeKey: (keyType) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${keyType}`);
  },
  hasKey: (keyType) => {
    return !!localStorage.getItem(`${STORAGE_PREFIX}${keyType}`);
  },
};

// ============================================
// WIKIPEDIA SERVICE
// ============================================

const fetchOnThisDay = async (month, day) => {
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${mm}/${dd}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }

  return response.json();
};

const parseWikipediaEvents = (response) => {
  const events = [];

  if (response.selected) {
    response.selected.forEach((event, index) => {
      events.push({
        id: `selected-${index}`,
        text: event.text,
        year: event.year,
        category: 'selected',
        wikipediaUrl: event.pages?.[0]?.content_urls?.desktop?.page,
        thumbnail: event.pages?.[0]?.thumbnail?.source,
      });
    });
  }

  if (response.events) {
    response.events.slice(0, 20).forEach((event, index) => {
      events.push({
        id: `events-${index}`,
        text: event.text,
        year: event.year,
        category: 'events',
        wikipediaUrl: event.pages?.[0]?.content_urls?.desktop?.page,
        thumbnail: event.pages?.[0]?.thumbnail?.source,
      });
    });
  }

  if (response.births) {
    response.births.slice(0, 10).forEach((event, index) => {
      events.push({
        id: `births-${index}`,
        text: event.text,
        year: event.year,
        category: 'births',
        wikipediaUrl: event.pages?.[0]?.content_urls?.desktop?.page,
        thumbnail: event.pages?.[0]?.thumbnail?.source,
      });
    });
  }

  if (response.deaths) {
    response.deaths.slice(0, 10).forEach((event, index) => {
      events.push({
        id: `deaths-${index}`,
        text: event.text,
        year: event.year,
        category: 'deaths',
        wikipediaUrl: event.pages?.[0]?.content_urls?.desktop?.page,
        thumbnail: event.pages?.[0]?.thumbnail?.source,
      });
    });
  }

  if (response.holidays) {
    response.holidays.forEach((holiday, index) => {
      events.push({
        id: `holidays-${index}`,
        text: holiday.text,
        year: undefined,
        category: 'holidays',
        wikipediaUrl: holiday.pages?.[0]?.content_urls?.desktop?.page,
        thumbnail: holiday.pages?.[0]?.thumbnail?.source,
      });
    });
  }

  return events;
};

// ============================================
// COMPONENTS
// ============================================

// Location Picker Component
function LocationPicker({ coordinates, isLoading, error, onRequestLocation, onManualInput }) {
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onManualInput({ latitude: lat, longitude: lng });
      setShowManual(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800 rounded-xl">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        📍 Location
      </h3>

      <button
        onClick={onRequestLocation}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                   rounded-lg text-white transition-all flex items-center justify-center gap-2
                   font-medium"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Detecting location...
          </>
        ) : (
          <>🎯 Use My Current Location</>
        )}
      </button>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded">{error}</p>
      )}

      {coordinates && (
        <div className="p-3 bg-slate-700/50 rounded-lg border border-green-500/30">
          <div className="text-green-400 font-mono text-sm">
            {formatCoordinate(coordinates.latitude, true)}, {formatCoordinate(coordinates.longitude, false)}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowManual(!showManual)}
        className="text-slate-400 hover:text-white text-sm underline"
      >
        {showManual ? 'Hide manual input' : 'Enter coordinates manually'}
      </button>

      {showManual && (
        <div className="space-y-2 p-3 bg-slate-700/30 rounded-lg">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Latitude"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="flex-1 p-2 bg-slate-700 rounded text-white placeholder-slate-500 
                         focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              step="0.0001"
              min="-90"
              max="90"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="flex-1 p-2 bg-slate-700 rounded text-white placeholder-slate-500 
                         focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              step="0.0001"
              min="-180"
              max="180"
            />
          </div>
          <button
            onClick={handleManualSubmit}
            className="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded text-white 
                       transition-colors text-sm"
          >
            Set Coordinates
          </button>
        </div>
      )}
    </div>
  );
}

// History Date Picker Component
function HistoryDatePicker({ date, onDateChange }) {
  const [year, setYear] = useState(date?.year?.toString() || '');
  const [month, setMonth] = useState(date?.month?.toString() || '1');
  const [day, setDay] = useState(date?.day?.toString() || '1');
  const [hour, setHour] = useState(date?.hour?.toString() || '');
  const [isBCE, setIsBCE] = useState(date?.isBCE || false);

  const handleUpdate = () => {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1) return;
    onDateChange({
      year: yearNum,
      month: parseInt(month),
      day: parseInt(day),
      hour: hour ? parseInt(hour) : undefined,
      isBCE,
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-3 p-4 bg-slate-800 rounded-xl">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        📅 Historical Date
      </h3>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {HISTORICAL_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onDateChange(preset.date)}
            className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 
                       border border-amber-500/40 rounded-full text-amber-200 
                       text-xs transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Manual Input */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 text-xs mb-1">Year</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 44"
              min="1"
              className="flex-1 p-2 bg-slate-700 rounded text-white placeholder-slate-500 
                         focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
            />
            <button
              onClick={() => setIsBCE(!isBCE)}
              className={`px-3 py-2 rounded font-medium transition-colors text-sm ${isBCE ? 'bg-amber-600 text-white' : 'bg-slate-600 text-slate-300'
                }`}
            >
              {isBCE ? 'BCE' : 'CE'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded text-white focus:ring-2 
                       focus:ring-amber-500 focus:outline-none text-sm"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Day</label>
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            min="1"
            max="31"
            className="w-full p-2 bg-slate-700 rounded text-white focus:ring-2 
                       focus:ring-amber-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs mb-1">Hour (optional)</label>
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="0-23"
            min="0"
            max="23"
            className="w-full p-2 bg-slate-700 rounded text-white placeholder-slate-500 
                       focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleUpdate}
        className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white 
                   transition-colors font-medium"
      >
        Set Date
      </button>

      {date && (
        <div className="p-3 bg-slate-700/50 rounded-lg border border-amber-500/30">
          <div className="text-amber-300 font-mono text-sm">
            {formatHistoricalDate(date)}
          </div>
        </div>
      )}
    </div>
  );
}

// On This Day Panel Component
function OnThisDayPanel({ date, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('selected');
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    if (date) {
      setIsLoading(true);
      setError(null);
      fetchOnThisDay(date.month, date.day)
        .then(response => {
          const parsed = parseWikipediaEvents(response);
          setEvents(parsed);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [date?.month, date?.day]);

  if (!date) {
    return (
      <div className="p-4 bg-slate-800 rounded-xl h-full flex items-center justify-center">
        <p className="text-slate-400 text-center">
          Select a date to see historical events
        </p>
      </div>
    );
  }

  const groupedEvents = {
    selected: events.filter(e => e.category === 'selected'),
    events: events.filter(e => e.category === 'events'),
    births: events.filter(e => e.category === 'births'),
    deaths: events.filter(e => e.category === 'deaths'),
    holidays: events.filter(e => e.category === 'holidays'),
  };

  const displayEvents = activeCategory === 'all'
    ? events
    : groupedEvents[activeCategory] || [];

  const sortedEvents = [...displayEvents].sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return a.year - b.year;
  });

  const formatYear = (year) => {
    if (!year) return '';
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  };

  return (
    <div className="p-4 bg-slate-800 rounded-xl space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">📅 On This Day</h3>
        <span className="text-slate-400 text-sm">{date.month}/{date.day}</span>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-full text-xs transition-colors ${activeCategory === 'all'
            ? 'bg-white/20 text-white'
            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
        >
          All ({events.length})
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
          const count = groupedEvents[cat]?.length || 0;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${activeCategory === cat
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
              <span>{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="animate-spin text-2xl">⏳</span>
          <span className="ml-2 text-slate-400">Loading...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Events List */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '400px' }}>
          {sortedEvents.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-sm">No events found</p>
          ) : (
            sortedEvents.map(event => {
              const config = CATEGORY_CONFIG[event.category];
              const isExpanded = expandedEvent === event.id;

              return (
                <div
                  key={event.id}
                  className="p-3 bg-slate-700/50 rounded-lg transition-all cursor-pointer
                             hover:bg-slate-700 border-l-2 border-slate-500"
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                >
                  <div className="flex items-start gap-2">
                    {event.thumbnail && (
                      <img
                        src={event.thumbnail}
                        alt=""
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      {event.year && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs 
                                         bg-slate-600 text-slate-300 mb-1">
                          {formatYear(event.year)}
                        </span>
                      )}

                      <p className={`text-slate-200 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {event.text}
                      </p>

                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          {event.wikipediaUrl && (
                            <a
                              href={event.wikipediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              📖 Wikipedia →
                            </a>
                          )}

                          {onSelectEvent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(event);
                              }}
                              className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 
                                       border border-purple-500/50 rounded text-purple-300 
                                       text-xs transition-colors"
                            >
                              🎨 Use for image generation
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="text-sm flex-shrink-0" title={config.label}>
                      {config.icon}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// API Key Settings Modal
function ApiKeySettings({ isOpen, onClose }) {
  const [inputs, setInputs] = useState({ openai: '', gemini: '' });
  const [savedKeys, setSavedKeys] = useState({ openai: false, gemini: false });
  const [validating, setValidating] = useState(null);

  useEffect(() => {
    setSavedKeys({
      openai: ApiKeyStorage.hasKey('openai'),
      gemini: ApiKeyStorage.hasKey('gemini'),
    });
  }, [isOpen]);

  const handleSave = async (keyType) => {
    const key = inputs[keyType].trim();
    if (!key) return;

    setValidating(keyType);

    // Simulate validation delay
    await new Promise(r => setTimeout(r, 1000));

    ApiKeyStorage.saveKey(keyType, key);
    setSavedKeys(prev => ({ ...prev, [keyType]: true }));
    setInputs(prev => ({ ...prev, [keyType]: '' }));
    setValidating(null);
  };

  const handleRemove = (keyType) => {
    ApiKeyStorage.removeKey(keyType);
    setSavedKeys(prev => ({ ...prev, [keyType]: false }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">🔑 API Key Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Provider Hierarchy */}
          <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
            <h3 className="text-sm font-medium text-slate-300">Provider Priority</h3>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">🍌 Nano Banana</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">🟢 DALL-E 3</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">🔵 Gemini</span>
            </div>
          </div>

          {/* Gemini Key (enables Nano Banana + Gemini) */}
          <div className="p-4 bg-slate-700/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔑</span>
                <span className="font-medium text-white">Google Gemini</span>
              </div>
              {savedKeys.gemini && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Enables:</span>
              <span className="px-2 py-0.5 bg-slate-600 rounded text-slate-300">🍌 Nano Banana</span>
              <span className="px-2 py-0.5 bg-slate-600 rounded text-slate-300">🔵 Gemini</span>
            </div>

            {savedKeys.gemini ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-slate-800 rounded text-slate-400 font-mono text-sm">
                  ••••••••••••••••
                </div>
                <button
                  onClick={() => handleRemove('gemini')}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={inputs.gemini}
                    onChange={(e) => setInputs(prev => ({ ...prev, gemini: e.target.value }))}
                    placeholder="AIza..."
                    className="flex-1 p-2 bg-slate-800 rounded text-white placeholder-slate-500 
                               focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => handleSave('gemini')}
                    disabled={validating === 'gemini' || !inputs.gemini.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                               rounded text-white text-sm min-w-[80px]"
                  >
                    {validating === 'gemini' ? '⏳' : 'Save'}
                  </button>
                </div>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Get API key →
                </a>
              </div>
            )}
          </div>

          {/* OpenAI Key */}
          <div className="p-4 bg-slate-700/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔑</span>
                <span className="font-medium text-white">OpenAI</span>
              </div>
              {savedKeys.openai && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Enables:</span>
              <span className="px-2 py-0.5 bg-slate-600 rounded text-slate-300">🟢 DALL-E 3</span>
            </div>

            {savedKeys.openai ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-slate-800 rounded text-slate-400 font-mono text-sm">
                  ••••••••••••••••
                </div>
                <button
                  onClick={() => handleRemove('openai')}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={inputs.openai}
                    onChange={(e) => setInputs(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="sk-..."
                    className="flex-1 p-2 bg-slate-800 rounded text-white placeholder-slate-500 
                               focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => handleSave('openai')}
                    disabled={validating === 'openai' || !inputs.openai.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                               rounded text-white text-sm min-w-[80px]"
                  >
                    {validating === 'openai' ? '⏳' : 'Save'}
                  </button>
                </div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Get API key →
                </a>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-300 text-xs">
              ⚠️ API keys are stored in your browser's localStorage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Generation Panel
function ImageGenerationPanel({ prompt, onOpenSettings }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('auto');

  const hasGeminiKey = ApiKeyStorage.hasKey('gemini');
  const hasOpenAIKey = ApiKeyStorage.hasKey('openai');
  const hasAnyKey = hasGeminiKey || hasOpenAIKey;

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    // Determine provider - Nano Banana is the requested primary model
    let provider = selectedProvider;
    if (provider === 'auto') {
      provider = hasGeminiKey ? 'nanobanana' : 'pollinations';
    }

    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      setError('Invalid provider selected');
      setIsGenerating(false);
      return;
    }

    setProgress(`${config.icon} Generating with ${config.name}...`);

    try {
      let imageUrl = null;

      if (provider === 'pollinations') {
        // 🆓 FREE - Pollinations.ai - No API Key, No Quota, Unlimited!
        // Simple URL-based API: https://image.pollinations.ai/prompt/{prompt}
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${seed}&nologo=true&model=flux`;

        // Pre-fetch to ensure the image is generated
        setProgress(`${config.icon} Rendering image...`);
        const testResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error('Image generation failed. Please try again.');
        }

      } else if (provider === 'nanobanana' || provider === 'gemini3') {
        // Gemini API (requires API key)
        const geminiKey = ApiKeyStorage.getKey('gemini');
        if (!geminiKey) {
          throw new Error('Gemini API key not configured');
        }

        // Nano Banana models - gemini-2.5-flash-image is the primary free-tier model
        const modelsToTry = provider === 'gemini3'
          ? ['gemini-3-pro-image-preview']
          : ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview'];

        let lastError = null;

        for (const model of modelsToTry) {
          try {
            setProgress(`${config.icon} Trying ${model}...`);
            // All image generation models require v1beta per official docs
            const apiVersion = 'v1beta';

            const response = await fetch(
              `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': geminiKey,
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"]
                  }
                }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errMsg = errorData.error?.message || `API error: ${response.status}`;
              if (errMsg.includes('quota') || errMsg.includes('Quota') || errMsg.includes('limit: 0')) {
                console.warn(`Model ${model} failed with quota, trying next...`);
                lastError = errMsg;
                continue; // Try next model in the chain
              }
              throw new Error(errMsg);
            }

            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }

            if (imageUrl) break; // Success!
          } catch (e) {
            console.error(`Trial with ${model} failed:`, e);
            lastError = e.message;
            if (!e.message.includes('quota') && !e.message.includes('limit: 0')) {
              throw e; // Reraise non-quota errors
            }
          }
        }

        if (!imageUrl) {
          throw new Error(`Nano Banana Quota reached on all models. ${lastError}`);
        }

      } else if (provider === 'openai') {
        // OpenAI DALL-E 3 (requires API key)
        const openaiKey = ApiKeyStorage.getKey('openai');
        if (!openaiKey) {
          throw new Error('OpenAI API key not configured');
        }

        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;
        if (!b64) {
          throw new Error('No image was generated');
        }
        imageUrl = `data:image/png;base64,${b64}`;
      }

      if (!imageUrl) {
        throw new Error('No image URL generated');
      }

      setResult({
        provider,
        imageUrl,
        generatedAt: new Date(),
      });

    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };


  // Pollinations is ALWAYS available as backup
  const availableProviders = ['nanobanana', 'gemini3', 'pollinations'];
  if (hasOpenAIKey) {
    availableProviders.push('openai');
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">🎨 Image Generation</h3>
          <button
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-white text-sm"
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-slate-400 text-sm">Provider:</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="flex-1 p-2 bg-slate-700 rounded text-white focus:outline-none text-sm"
            disabled={isGenerating}
          >
            <option value="auto">
              🤖 Auto (Best Available)
            </option>
            {availableProviders.map(p => {
              const config = PROVIDER_CONFIG[p];
              return (
                <option key={p} value={p}>
                  {config.icon} {config.name}
                </option>
              );
            })}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700 
                     disabled:from-slate-600 disabled:to-slate-600
                     rounded-lg text-white font-semibold transition-all 
                     flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              {progress || 'Generating...'}
            </>
          ) : (
            <>🖼️ Generate Image</>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="p-4 bg-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">
              Generated by {PROVIDER_CONFIG[result.provider].icon} {PROVIDER_CONFIG[result.provider].name}
            </span>
            <a
              href={result.imageUrl}
              download={`time-machine-${Date.now()}.png`}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
            >
              ⬇️ Download
            </a>
          </div>
          <div className="rounded-lg overflow-hidden bg-slate-900">
            <img
              src={result.imageUrl}
              alt="Generated historical scene"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function HistoryTimeMachine() {
  // Location State
  const [coordinates, setCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Date State
  const [date, setDate] = useState(null);

  // Prompt State
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  // UI State
  const [showSettings, setShowSettings] = useState(false);

  // Request Location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        const errorMessages = {
          1: 'Location permission denied',
          2: 'Location unavailable',
          3: 'Location request timed out',
        };
        setLocationError(errorMessages[err.code] || 'Unknown error');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Generate Prompt
  const handleGeneratePrompt = () => {
    if (!coordinates || !date) return;
    const prompt = generatePrompt(coordinates, date);
    setGeneratedPrompt(prompt);
    setSelectedEvent(null);
    setCopied(false);
  };

  // Select Event from Wikipedia
  const handleSelectEvent = (event) => {
    const prompt = generateEventPrompt(event, coordinates);
    setGeneratedPrompt(prompt);
    setSelectedEvent(event);
    setCopied(false);
  };

  // Copy Prompt
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = generatedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canGenerate = coordinates && date;

  return (
    <div className="min-h-screen bg-slate-900 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <header className="text-center space-y-1 py-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            🕰️ History Time Machine
          </h1>
          <p className="text-slate-400 text-sm">
            Travel through time with AI-generated historical imagery
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <LocationPicker
              coordinates={coordinates}
              isLoading={locationLoading}
              error={locationError}
              onRequestLocation={requestLocation}
              onManualInput={setCoordinates}
            />

            <HistoryDatePicker
              date={date}
              onDateChange={setDate}
            />

            <button
              onClick={handleGeneratePrompt}
              disabled={!canGenerate}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 
                         hover:from-amber-700 hover:to-orange-700 
                         disabled:from-slate-600 disabled:to-slate-600
                         rounded-xl text-white text-lg font-semibold 
                         transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {canGenerate ? '✨ Create Time Travel Prompt' : 'Set location and date first'}
            </button>
          </div>

          {/* Right Column */}
          <OnThisDayPanel
            date={date}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* Selected Event Indicator */}
        {selectedEvent && (
          <div className="p-3 bg-purple-500/20 border border-purple-500/50 rounded-xl 
                        flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-purple-300 text-sm">🎯 Using event:</span>
              <span className="text-white text-sm truncate">
                {selectedEvent.text.substring(0, 50)}...
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null);
                if (coordinates && date) {
                  setGeneratedPrompt(generatePrompt(coordinates, date));
                }
              }}
              className="text-purple-300 hover:text-white text-sm whitespace-nowrap"
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className="p-4 bg-slate-800 rounded-xl space-y-3">
            <h3 className="text-lg font-semibold text-white">Generated Prompt</h3>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 
                          text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap
                          max-h-32 overflow-y-auto">
              {generatedPrompt}
            </div>
            <button
              onClick={handleCopy}
              className={`w-full py-2 rounded-lg transition-colors font-medium ${copied
                ? 'bg-green-600 text-white'
                : 'bg-slate-600 hover:bg-slate-500 text-white'
                }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        )}

        {/* Image Generation */}
        <ImageGenerationPanel
          prompt={generatedPrompt}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Settings Modal */}
        <ApiKeySettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Footer */}
        <footer className="text-center text-slate-500 text-xs py-4">
          <p>Historical data from Wikipedia • Images generated by AI</p>
          <p className="mt-1">🍌 Nano Banana → 🟢 DALL-E 3 → 🔵 Gemini</p>
        </footer>
      </div>
    </div>
  );
}
