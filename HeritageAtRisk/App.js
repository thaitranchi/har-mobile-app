import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#EC253C',
  backgroundDark: '#8F2227',
  white: '#FFFFFF',
  primaryBlue: '#208AD4',
  placeholder: '#757575',
  text: '#111111',
  rowAlt: '#DE535C',
  rowBase: '#E26971',
  overlay: 'rgba(0, 0, 0, 0.45)',
  muted: 'rgba(255, 255, 255, 0.82)',
};

const API_CONFIG = {
  baseUrl: 'https://api.heobs.org',
  consumerKey: '',
  consumerSecret: '',
};

const STORAGE_KEYS = {
  session: '@har/session',
  reports: '@har/reports',
  settings: '@har/settings',
};

const DEFAULT_SETTINGS = {
  gpsAcceptableAccuracy: '25',
  gpsAccuracyAlertSeconds: '30',
  wirelessSyncOnly: false,
};

const DESIGNATIONS = ['LB', 'LPW', 'SM', 'RGP', 'RB', 'PWS', 'CA'];
const CONDITIONS = ['bad', 'poor', 'fair', 'good'];
const OCCUPANCIES = [
  'vacant',
  'occupied',
  'part_occupied',
  'unknown',
  'not_applicable',
];
const PRIORITIES = ['A', 'B', 'C', 'D', 'E', 'F'];
const OWNER_TYPES = [
  'local_authority',
  'multiple_owners',
  'religious_organization',
  'private',
];
const GRADE_OPTIONS = ['I', 'II', 'II*', 'Unknown'];

const logoImage = require('./src/assets/logo_har.2.0.png');
const eyeImage = require('./src/assets/ic_eye.png');
const eyeSlashImage = require('./src/assets/ic_eye_slash.png');
const menuImage = require('./src/assets/menu_icon.png');
const cameraImage = require('./src/assets/camera.png');
const trashImage = require('./src/assets/trashcan.png');
const locationImage = require('./src/assets/location.png');
const clockImage = require('./src/assets/clock.png');
const cloudDoneImage = require('./src/assets/oncloud.png');
const cloudPendingImage = require('./src/assets/notoncloud.png');
const blueCircleImage = require('./src/assets/bluecircle.png');

const emailPattern =
  /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[^"\\]|\\.)+")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const createId = prefix =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const formatDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseStoredJson = fallback => async key => {
  const rawValue = await AsyncStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return fallback;
  }
};

const sha1 = message => {
  const utf8 = unescape(encodeURIComponent(message));
  const bytes = [];

  for (let index = 0; index < utf8.length; index += 1) {
    bytes.push(utf8.charCodeAt(index));
  }

  const originalBitLength = bytes.length * 8;
  bytes.push(0x80);

  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }

  const highBits = Math.floor(originalBitLength / 0x100000000);
  const lowBits = originalBitLength >>> 0;

  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((highBits >>> shift) & 0xff);
  }

  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((lowBits >>> shift) & 0xff);
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array(80).fill(0);

    for (let index = 0; index < 16; index += 1) {
      const start = offset + index * 4;
      words[index] =
        (bytes[start] << 24) |
        (bytes[start + 1] << 16) |
        (bytes[start + 2] << 8) |
        bytes[start + 3];
    }

    for (let index = 16; index < 80; index += 1) {
      const value =
        words[index - 3] ^
        words[index - 8] ^
        words[index - 14] ^
        words[index - 16];
      words[index] = ((value << 1) | (value >>> 31)) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      let fn = 0;
      let constant = 0;

      if (index < 20) {
        fn = (b & c) | (~b & d);
        constant = 0x5a827999;
      } else if (index < 40) {
        fn = b ^ c ^ d;
        constant = 0x6ed9eba1;
      } else if (index < 60) {
        fn = (b & c) | (b & d) | (c & d);
        constant = 0x8f1bbcdc;
      } else {
        fn = b ^ c ^ d;
        constant = 0xca62c1d6;
      }

      const temp =
        ((((a << 5) | (a >>> 27)) >>> 0) + fn + e + constant + words[index]) >>>
        0;

      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4]
    .map(value => value.toString(16).padStart(8, '0'))
    .join('');
};

const hmacSha1 = (key, message) => {
  const blockSize = 64;
  let normalizedKey = unescape(encodeURIComponent(key));

  if (normalizedKey.length > blockSize) {
    const hashedKey = sha1(normalizedKey);
    let nextKey = '';

    for (let index = 0; index < hashedKey.length; index += 2) {
      nextKey += String.fromCharCode(parseInt(hashedKey.slice(index, index + 2), 16));
    }

    normalizedKey = nextKey;
  }

  while (normalizedKey.length < blockSize) {
    normalizedKey += '\0';
  }

  let outer = '';
  let inner = '';

  for (let index = 0; index < blockSize; index += 1) {
    const code = normalizedKey.charCodeAt(index);
    outer += String.fromCharCode(code ^ 0x5c);
    inner += String.fromCharCode(code ^ 0x36);
  }

  const innerDigest = sha1(inner + message);
  let innerBinary = '';

  for (let index = 0; index < innerDigest.length; index += 2) {
    innerBinary += String.fromCharCode(
      parseInt(innerDigest.slice(index, index + 2), 16),
    );
  }

  return sha1(outer + innerBinary);
};

const buildSignedHeaders = (path, body, sessionId) => {
  if (!API_CONFIG.consumerKey || !API_CONFIG.consumerSecret) {
    throw new Error(
      'Missing API credentials. Set API_CONFIG.consumerKey and API_CONFIG.consumerSecret in App.js.',
    );
  }

  const bodyText = body ? JSON.stringify(body) : '';
  const signature = hmacSha1(
    API_CONFIG.consumerSecret,
    `${path.replace(/^\//, '')}${bodyText}`,
  );

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_CONFIG.consumerKey,
    'X-API-Sig': signature,
  };

  if (sessionId) {
    headers['X-Authentication'] = sessionId;
  }

  return {headers, bodyText};
};

const createApiClient = sessionId => ({
  async connect(email, password) {
    const path = '/account/session';
    const body = {
      email_address: email,
      password,
    };
    const {headers, bodyText} = buildSignedHeaders(path, body);

    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: bodyText,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || payload.error || 'Connection failed.');
    }

    return payload;
  },

  async fetchReports() {
    const path = '/har/report';
    const {headers} = buildSignedHeaders(path, null, sessionId);
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'GET',
      headers,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || payload.error || 'Unable to fetch reports.');
    }

    return payload.map(item => ({
      id: item.report_id,
      name: item.name || 'Unnamed heritage',
      formattedAddress: item.formatted_address || 'Address unavailable',
      creationTime: item.creation_time,
      status: 'stored',
      remoteId: item.report_id,
      payload: item,
      photos: [],
    }));
  },

  async deleteReport(reportId) {
    const path = `/har/report/${reportId}`;
    const {headers} = buildSignedHeaders(path, null, sessionId);
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      let payload = {};

      try {
        payload = await response.json();
      } catch (error) {
        payload = {};
      }

      throw new Error(payload.message || payload.error || 'Delete failed.');
    }
  },

  async createReport(draft) {
    const path = '/har/report';
    const body = {
      condition: draft.condition,
      designation: draft.designation,
      grade: draft.grade,
      occupancy: draft.occupancy,
      owner_type: draft.ownerType,
      place_name: draft.placeName,
      priority_category: draft.priorityCategory,
    };
    const {headers, bodyText} = buildSignedHeaders(path, body, sessionId);
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: bodyText,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || payload.error || 'Unable to create report.');
    }

    return payload;
  },
});

const Header = ({showCancel, onCancel, onOpenSettings}) => (
  <View style={styles.header}>
    <Image source={logoImage} style={styles.headerLogo} resizeMode="contain" />
    <View style={styles.headerSpacer} />
    {showCancel ? (
      <TouchableOpacity onPress={onCancel} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={onOpenSettings}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Image source={menuImage} style={styles.menuIcon} resizeMode="contain" />
      </TouchableOpacity>
    )}
  </View>
);

const InputField = ({
  value,
  placeholder,
  isFocused,
  hasValue,
  rightAccessory,
  ...rest
}) => {
  const borderColor = isFocused ? COLORS.primaryBlue : COLORS.backgroundDark;
  const textColor = hasValue ? COLORS.text : COLORS.placeholder;

  return (
    <View style={[styles.inputWrapper, {borderColor}]}>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        style={[styles.input, {color: textColor}]}
        {...rest}
      />
      {rightAccessory ? <View style={styles.inputAccessory}>{rightAccessory}</View> : null}
    </View>
  );
};

const ValidationText = ({text}) => (
  <View style={styles.validationContainer}>
    <Text style={styles.validationText}>{text || ' '}</Text>
  </View>
);

const ConnectionScreen = ({
  email,
  password,
  emailMeta,
  passwordMeta,
  showPassword,
  isConnecting,
  onChangeEmail,
  onChangePassword,
  onEmailFocus,
  onPasswordFocus,
  onEmailBlur,
  onPasswordBlur,
  onTogglePassword,
  onConnect,
}) => (
  <SafeAreaView style={styles.screen}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
    <View style={styles.connectionContainer}>
      <Image source={logoImage} style={styles.connectionLogo} resizeMode="contain" />
      <InputField
        value={email}
        placeholder="Email Address"
        isFocused={emailMeta.isFocused}
        hasValue={email.trim().length > 0}
        onFocus={onEmailFocus}
        onBlur={onEmailBlur}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ValidationText text={emailMeta.error} />
      <InputField
        value={password}
        placeholder="Password"
        isFocused={passwordMeta.isFocused}
        hasValue={password.length > 0}
        onFocus={onPasswordFocus}
        onBlur={onPasswordBlur}
        onChangeText={onChangePassword}
        secureTextEntry={!showPassword}
        rightAccessory={
          <TouchableOpacity
            onPress={onTogglePassword}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Image
              source={showPassword ? eyeImage : eyeSlashImage}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />
      <ValidationText text={passwordMeta.error} />
      <TouchableOpacity style={styles.forgotPasswordRow}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.connectButton} onPress={onConnect} disabled={isConnecting}>
        <Text style={styles.connectButtonText}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.connectionHint}>
        We will automatically create an account if you are not registered yet.
      </Text>
    </View>
  </SafeAreaView>
);

const ReportsListScreen = ({
  reports,
  isSyncing,
  onRefresh,
  onDelete,
  onOpenCreation,
  onOpenSettings,
}) => (
  <SafeAreaView style={styles.screen}>
    <Header onOpenSettings={onOpenSettings} />
    <View style={styles.listBody}>
      <ScrollView contentContainerStyle={styles.reportListContent}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No reports yet</Text>
            <Text style={styles.emptyStateText}>
              Use the camera button to create the first heritage at risk report.
            </Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <ReportRow
              key={report.id}
              report={report}
              isAlternate={index % 2 === 0}
              onDelete={() => onDelete(report)}
            />
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>{isSyncing ? 'Syncing...' : 'Refresh'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fabButton} onPress={onOpenCreation} activeOpacity={0.9}>
        <Image source={blueCircleImage} style={styles.fabBackground} resizeMode="contain" />
        <Image source={cameraImage} style={styles.fabCamera} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const ReportRow = ({report, isAlternate, onDelete}) => (
  <View
    style={[
      styles.reportRow,
      {backgroundColor: isAlternate ? COLORS.rowAlt : COLORS.rowBase},
    ]}>
    <View style={styles.reportDetails}>
      <Text style={styles.reportTitle}>{report.name || 'Unnamed heritage'}</Text>
      <View style={styles.reportMetaRow}>
        <View style={styles.reportMetaItem}>
          <Image source={locationImage} style={styles.metaIconSmall} resizeMode="contain" />
          <Text style={styles.reportMetaText}>
            {report.formattedAddress || 'Address unavailable'}
          </Text>
        </View>
      </View>
      <View style={styles.reportMetaRow}>
        <View style={styles.reportMetaItem}>
          <Image source={clockImage} style={styles.metaIconClock} resizeMode="contain" />
          <Text style={styles.reportMetaText}>{formatDate(report.creationTime)}</Text>
        </View>
      </View>
    </View>
    <View style={styles.reportActions}>
      <TouchableOpacity onPress={onDelete}>
        <Image source={trashImage} style={styles.rowActionIcon} resizeMode="contain" />
      </TouchableOpacity>
      <Image
        source={report.status === 'stored' ? cloudDoneImage : cloudPendingImage}
        style={styles.rowActionIcon}
        resizeMode="contain"
      />
    </View>
  </View>
);

const SettingsModal = ({visible, settings, onChange, onClose}) => (
  <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
    <View style={styles.settingsOverlay}>
      <TouchableOpacity style={styles.settingsBackdrop} onPress={onClose} activeOpacity={1} />
      <View style={styles.settingsPanel}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <Text style={styles.settingsLabel}>GPS acceptable accuracy (meters)</Text>
        <TextInput
          style={styles.settingsInput}
          keyboardType="numeric"
          value={settings.gpsAcceptableAccuracy}
          onChangeText={value => onChange('gpsAcceptableAccuracy', value.replace(/[^\d]/g, ''))}
        />
        <Text style={styles.settingsLabel}>GPS accuracy alert (seconds)</Text>
        <TextInput
          style={styles.settingsInput}
          keyboardType="numeric"
          value={settings.gpsAccuracyAlertSeconds}
          onChangeText={value =>
            onChange('gpsAccuracyAlertSeconds', value.replace(/[^\d]/g, ''))
          }
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Wireless network sync only</Text>
          <Switch
            value={settings.wirelessSyncOnly}
            onValueChange={value => onChange('wirelessSyncOnly', value)}
          />
        </View>
        <TouchableOpacity style={styles.settingsCloseButton} onPress={onClose}>
          <Text style={styles.settingsCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ReportCreationScreen = ({
  draft,
  settings,
  onCancel,
  onCapturePhoto,
  onDeletePhoto,
  onContinue,
}) => (
  <SafeAreaView style={styles.screen}>
    <Header showCancel onCancel={onCancel} />
    <ScrollView contentContainerStyle={styles.creationScroll}>
      <View style={styles.cameraPreview}>
        <Text style={styles.cameraPreviewTitle}>Camera Preview</Text>
        <Text style={styles.cameraPreviewText}>
          Native camera integration is represented here by a development-safe capture surface.
        </Text>
        <TouchableOpacity style={styles.captureButton} onPress={onCapturePhoto}>
          <Image source={cameraImage} style={styles.captureButtonIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
      <PhotoStrip photos={draft.photos} onDeletePhoto={onDeletePhoto} />
      <View style={styles.mapCard}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        <Text style={styles.mapCoordinates}>
          {`${draft.currentLocation.latitude.toFixed(5)}, ${draft.currentLocation.longitude.toFixed(
            5,
          )}`}
        </Text>
        <Text style={styles.mapNote}>
          Accuracy target: {settings.gpsAcceptableAccuracy || '25'}m. Each captured photo is linked
          to the latest location update.
        </Text>
        <View style={styles.mapPlaceholder}>
          {draft.photos.length === 0 ? (
            <Text style={styles.mapPlaceholderText}>Map markers appear after photos are captured.</Text>
          ) : (
            draft.photos.map(photo => (
              <View
                key={photo.id}
                style={[
                  styles.mapMarker,
                  {
                    left: `${18 + (photo.location.longitude % 1) * 55}%`,
                    top: `${18 + (photo.location.latitude % 1) * 45}%`,
                  },
                ]}
              />
            ))
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.primaryAction} onPress={onContinue}>
        <Text style={styles.primaryActionText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const PhotoStrip = ({photos, onDeletePhoto, onAddMore}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.photoStrip}>
    {photos.map(photo => (
      <View key={photo.id} style={styles.photoCard}>
        <View style={styles.photoThumb}>
          <Text style={styles.photoThumbText}>{photo.label}</Text>
          <Text style={styles.photoThumbLocation}>{formatDate(photo.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.photoDeleteButton} onPress={() => onDeletePhoto(photo.id)}>
          <Text style={styles.photoDeleteText}>X</Text>
        </TouchableOpacity>
      </View>
    ))}
    {onAddMore ? (
      <TouchableOpacity style={styles.cameraMaskCard} onPress={onAddMore}>
        <Image source={cameraImage} style={styles.cameraMaskIcon} resizeMode="contain" />
        <Text style={styles.cameraMaskText}>Add</Text>
      </TouchableOpacity>
    ) : null}
  </ScrollView>
);

const ReportSubmissionScreen = ({
  draft,
  onCancel,
  onBackToCapture,
  onDeletePhoto,
  onUpdateField,
  onSubmit,
  isSubmitting,
}) => (
  <SafeAreaView style={styles.screen}>
    <Header showCancel onCancel={onCancel} />
    <ScrollView contentContainerStyle={styles.submissionScroll}>
      <Text style={styles.sectionTitle}>Report Submission</Text>
      <FormRow label="Heritage Name">
        <TextInput
          style={styles.dropdownInput}
          value={draft.placeName}
          placeholder="Enter the heritage name"
          placeholderTextColor={COLORS.placeholder}
          onChangeText={value => onUpdateField('placeName', value)}
        />
      </FormRow>
      <FormRow label="Designation">
        <SegmentPicker
          options={DESIGNATIONS}
          value={draft.designation}
          onChange={value => onUpdateField('designation', value)}
        />
      </FormRow>
      <FormRow label="Condition">
        <SegmentPicker
          options={CONDITIONS}
          value={draft.condition}
          onChange={value => onUpdateField('condition', value)}
        />
      </FormRow>
      <FormRow label="Grade">
        <SegmentPicker
          options={GRADE_OPTIONS}
          value={draft.grade}
          onChange={value => onUpdateField('grade', value)}
        />
      </FormRow>
      <FormRow label="Occupancy">
        <SegmentPicker
          options={OCCUPANCIES}
          value={draft.occupancy}
          onChange={value => onUpdateField('occupancy', value)}
        />
      </FormRow>
      <FormRow label="Priority Category">
        <SegmentPicker
          options={PRIORITIES}
          value={draft.priorityCategory}
          onChange={value => onUpdateField('priorityCategory', value)}
        />
      </FormRow>
      <FormRow label="Owner Type">
        <SegmentPicker
          options={OWNER_TYPES}
          value={draft.ownerType}
          onChange={value => onUpdateField('ownerType', value)}
        />
      </FormRow>
      <Text style={styles.sectionTitle}>Photos</Text>
      <PhotoStrip
        photos={draft.photos}
        onDeletePhoto={onDeletePhoto}
        onAddMore={onBackToCapture}
      />
      <TouchableOpacity style={styles.primaryAction} onPress={onSubmit} disabled={isSubmitting}>
        <Text style={styles.primaryActionText}>
          {isSubmitting ? 'Queueing Report...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const FormRow = ({label, children}) => (
  <View style={styles.formRow}>
    <Text style={styles.formLabel}>{label}</Text>
    {children}
  </View>
);

const SegmentPicker = ({options, value, onChange}) => (
  <View style={styles.segmentContainer}>
    {options.map(option => (
      <TouchableOpacity
        key={option}
        style={[styles.segmentOption, value === option && styles.segmentOptionActive]}
        onPress={() => onChange(option)}>
        <Text style={[styles.segmentText, value === option && styles.segmentTextActive]}>
          {option}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const createEmptyDraft = () => ({
  id: createId('draft'),
  placeName: '',
  designation: DESIGNATIONS[0],
  condition: CONDITIONS[0],
  grade: GRADE_OPTIONS[0],
  occupancy: OCCUPANCIES[0],
  priorityCategory: PRIORITIES[0],
  ownerType: OWNER_TYPES[0],
  photos: [],
  currentLocation: {
    latitude: 10.77689,
    longitude: 106.70081,
    accuracy: 12,
    altitude: 8,
  },
});

const App = () => {
  const [screen, setScreen] = useState('connection');
  const [session, setSession] = useState(null);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailMeta, setEmailMeta] = useState({isFocused: false, error: ''});
  const [passwordMeta, setPasswordMeta] = useState({isFocused: false, error: ''});
  const locationTicker = useRef(null);

  const api = useMemo(
    () => (session && session.session_id ? createApiClient(session.session_id) : null),
    [session],
  );

  useEffect(() => {
    const load = async () => {
      const readJson = parseStoredJson(null);

      try {
        const [storedSession, storedReports, storedSettings] = await Promise.all([
          readJson(STORAGE_KEYS.session),
          parseStoredJson([])(STORAGE_KEYS.reports),
          parseStoredJson(DEFAULT_SETTINGS)(STORAGE_KEYS.settings),
        ]);

        if (storedSession && storedSession.session_id) {
          setSession(storedSession);
          setScreen('reports');
        }

        if (Array.isArray(storedReports)) {
          setReports(storedReports);
        }

        if (storedSettings) {
          setSettings({...DEFAULT_SETTINGS, ...storedSettings});
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
  }, [isBootstrapping, reports]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [isBootstrapping, settings]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (session && session.session_id) {
      AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.session);
    }
  }, [isBootstrapping, session]);

  useEffect(() => {
    if (screen !== 'creation') {
      if (locationTicker.current) {
        clearInterval(locationTicker.current);
        locationTicker.current = null;
      }
      return undefined;
    }

    locationTicker.current = setInterval(() => {
      setDraft(currentDraft => ({
        ...currentDraft,
        currentLocation: {
          ...currentDraft.currentLocation,
          latitude: currentDraft.currentLocation.latitude + (Math.random() - 0.5) * 0.00035,
          longitude: currentDraft.currentLocation.longitude + (Math.random() - 0.5) * 0.00035,
          accuracy: Math.max(
            3,
            Math.min(
              50,
              currentDraft.currentLocation.accuracy + Math.round((Math.random() - 0.5) * 8),
            ),
          ),
        },
      }));
    }, 3500);

    return () => {
      if (locationTicker.current) {
        clearInterval(locationTicker.current);
        locationTicker.current = null;
      }
    };
  }, [screen]);

  const validateEmailField = currentEmail => {
    if (!currentEmail) {
      return 'You cannot leave this field empty.';
    }
    if (!emailPattern.test(currentEmail)) {
      return 'The email address entered is invalid.';
    }
    return '';
  };

  const validatePasswordField = currentPassword => {
    if (!currentPassword) {
      return 'You cannot leave this field empty.';
    }
    return '';
  };

  const refreshReports = async explicitSessionId => {
    const activeSessionId = explicitSessionId || (session && session.session_id);

    if (!activeSessionId) {
      return;
    }

    setIsSyncing(true);

    try {
      const remoteReports = await createApiClient(activeSessionId).fetchReports();
      const queuedReports = reports.filter(report => report.status === 'queued');
      setReports([...queuedReports, ...remoteReports]);
    } catch (error) {
      Alert.alert('Report Synchronization Failure', error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const flushQueuedReports = async () => {
    if (!api || settings.wirelessSyncOnly) {
      return;
    }

    const queuedReports = reports.filter(report => report.status === 'queued');
    if (queuedReports.length === 0) {
      return;
    }

    setIsSyncing(true);

    try {
      for (const queuedReport of queuedReports) {
        const response = await api.createReport(queuedReport.payload);
        setReports(currentReports =>
          currentReports.map(report =>
            report.id === queuedReport.id
              ? {
                  ...report,
                  status: 'stored',
                  remoteId: response.report_id,
                  creationTime: response.creation_time || report.creationTime,
                }
              : report,
          ),
        );
      }
    } catch (error) {
      Alert.alert(
        'Report Queue Notice',
        'The report stays queued locally because the online platform cannot be reached right now.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!api || reports.every(report => report.status !== 'queued')) {
      return;
    }

    flushQueuedReports();
  }, [api]);

  const handleEmailBlur = () => {
    const trimmedValue = email.trim();
    setEmail(trimmedValue);
    setEmailMeta({
      isFocused: false,
      error: trimmedValue ? validateEmailField(trimmedValue) : '',
    });
  };

  const handlePasswordBlur = () => {
    setPasswordMeta({
      isFocused: false,
      error: password ? validatePasswordField(password) : '',
    });
  };

  const handleConnect = async () => {
    const trimmedEmail = email.trim();
    const nextEmailError = validateEmailField(trimmedEmail);
    const nextPasswordError = validatePasswordField(password);

    setEmail(trimmedEmail);
    setEmailMeta({isFocused: false, error: nextEmailError});
    setPasswordMeta({isFocused: false, error: nextPasswordError});

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsConnecting(true);

    try {
      const client = createApiClient();
      const nextSession = await client.connect(trimmedEmail, password);
      setSession(nextSession);
      setScreen('reports');
      setPassword('');
      await refreshReports(nextSession.session_id);
    } catch (error) {
      Alert.alert('Connection Failure', error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeleteReport = report => {
    const removeLocally = () => {
      setReports(currentReports => currentReports.filter(item => item.id !== report.id));
    };

    if (report.status === 'queued' || !report.remoteId || !api) {
      removeLocally();
      return;
    }

    Alert.alert('Delete Report', 'Do you want to remove this report?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteReport(report.remoteId);
            removeLocally();
          } catch (error) {
            Alert.alert(
              'Report Deletion Failure',
              'Our servers cannot process your request at this time. Please try again later.',
            );
          }
        },
      },
    ]);
  };

  const handleOpenCreation = () => {
    setDraft(createEmptyDraft());
    setScreen('creation');
  };

  const handleCancelDraft = () => {
    setDraft(createEmptyDraft());
    setScreen('reports');
  };

  const handleCapturePhoto = () => {
    if (draft.photos.length >= 20) {
      Alert.alert('Capture Limit Reached', 'A report can contain at most 20 photos.');
      return;
    }

    const photoIndex = draft.photos.length + 1;
    const photo = {
      id: createId('photo'),
      label: `Photo ${photoIndex}`,
      createdAt: new Date().toISOString(),
      location: {
        ...draft.currentLocation,
      },
    };

    setDraft(currentDraft => ({
      ...currentDraft,
      photos: [...currentDraft.photos, photo],
    }));
  };

  const handleDeletePhoto = photoId => {
    setDraft(currentDraft => ({
      ...currentDraft,
      photos: currentDraft.photos.filter(photo => photo.id !== photoId),
    }));
  };

  const handleContinueToSubmission = () => {
    if (draft.photos.length === 0) {
      Alert.alert('Missing Photo', 'Capture at least one photo before continuing.');
      return;
    }

    setScreen('submission');
  };

  const handleSubmitReport = async () => {
    if (!draft.placeName.trim()) {
      Alert.alert('Missing Heritage Name', 'Enter the heritage name before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const queuedReport = {
        id: draft.id,
        remoteId: null,
        status: 'queued',
        name: draft.placeName.trim(),
        formattedAddress: `${draft.currentLocation.latitude.toFixed(
          4,
        )}, ${draft.currentLocation.longitude.toFixed(4)}`,
        creationTime: new Date().toISOString(),
        photos: draft.photos,
        payload: {
          ...draft,
          placeName: draft.placeName.trim(),
        },
      };

      setReports(currentReports => [queuedReport, ...currentReports]);
      setDraft(createEmptyDraft());
      setScreen('reports');

      if (api && !settings.wirelessSyncOnly) {
        await flushQueuedReports();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(currentSettings => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  if (isBootstrapping) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <Image source={logoImage} style={styles.connectionLogo} resizeMode="contain" />
          <Text style={styles.loadingText}>Loading Heritage at Risk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {screen === 'connection' ? (
        <ConnectionScreen
          email={email}
          password={password}
          emailMeta={emailMeta}
          passwordMeta={passwordMeta}
          showPassword={showPassword}
          isConnecting={isConnecting}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onEmailFocus={() => setEmailMeta(current => ({...current, isFocused: true, error: ''}))}
          onPasswordFocus={() =>
            setPasswordMeta(current => ({...current, isFocused: true, error: ''}))
          }
          onEmailBlur={handleEmailBlur}
          onPasswordBlur={handlePasswordBlur}
          onTogglePassword={() => setShowPassword(current => !current)}
          onConnect={handleConnect}
        />
      ) : null}

      {screen === 'reports' ? (
        <ReportsListScreen
          reports={reports}
          isSyncing={isSyncing}
          onRefresh={refreshReports}
          onDelete={handleDeleteReport}
          onOpenCreation={handleOpenCreation}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : null}

      {screen === 'creation' ? (
        <ReportCreationScreen
          draft={draft}
          settings={settings}
          onCancel={handleCancelDraft}
          onCapturePhoto={handleCapturePhoto}
          onDeletePhoto={handleDeletePhoto}
          onContinue={handleContinueToSubmission}
        />
      ) : null}

      {screen === 'submission' ? (
        <ReportSubmissionScreen
          draft={draft}
          onCancel={handleCancelDraft}
          onBackToCapture={() => setScreen('creation')}
          onDeletePhoto={handleDeletePhoto}
          onUpdateField={(field, value) =>
            setDraft(currentDraft => ({
              ...currentDraft,
              [field]: value,
            }))
          }
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
        />
      ) : null}

      <SettingsModal
        visible={showSettings}
        settings={settings}
        onChange={handleSettingsChange}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  connectionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  connectionLogo: {
    width: 198,
    height: 198,
    marginBottom: 12,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
  },
  inputAccessory: {
    marginLeft: 8,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.placeholder,
  },
  validationContainer: {
    width: '100%',
    minHeight: 20,
    marginBottom: 4,
  },
  validationText: {
    color: COLORS.white,
    fontSize: 13,
  },
  forgotPasswordRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  linkText: {
    color: COLORS.white,
    fontSize: 14,
  },
  connectButton: {
    width: '100%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 4,
    marginBottom: 18,
  },
  connectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  connectionHint: {
    width: '100%',
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  headerLogo: {
    width: 42,
    height: 42,
  },
  headerSpacer: {
    flex: 1,
  },
  menuIcon: {
    width: 24,
    height: 20,
  },
  cancelText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listBody: {
    flex: 1,
  },
  reportListContent: {
    paddingBottom: 120,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  reportRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  reportDetails: {
    flex: 1,
    paddingRight: 12,
  },
  reportTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  reportMetaRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  metaIconSmall: {
    width: 10,
    height: 12,
    marginRight: 6,
  },
  metaIconClock: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  reportMetaText: {
    color: COLORS.white,
    fontSize: 12,
  },
  reportActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowActionIcon: {
    width: 20,
    height: 20,
    marginVertical: 8,
  },
  fabButton: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBackground: {
    width: 58,
    height: 58,
  },
  fabCamera: {
    width: 22,
    height: 22,
    position: 'absolute',
  },
  refreshButton: {
    position: 'absolute',
    left: 20,
    bottom: 28,
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.overlay,
  },
  settingsBackdrop: {
    flex: 1,
  },
  settingsPanel: {
    width: 320,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'flex-start',
  },
  settingsTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
  },
  settingsLabel: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 8,
  },
  settingsInput: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  switchLabel: {
    color: COLORS.white,
    flex: 1,
    paddingRight: 12,
  },
  settingsCloseButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 4,
  },
  settingsCloseText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  creationScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  cameraPreview: {
    minHeight: 240,
    backgroundColor: '#B81D31',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cameraPreviewTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  cameraPreviewText: {
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonIcon: {
    width: 28,
    height: 28,
  },
  photoStrip: {
    paddingBottom: 4,
    marginBottom: 18,
  },
  photoCard: {
    width: 118,
    height: 110,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginRight: 12,
    overflow: 'hidden',
  },
  photoThumb: {
    flex: 1,
    backgroundColor: '#FFD7DB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  photoThumbText: {
    color: COLORS.backgroundDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  photoThumbLocation: {
    color: COLORS.backgroundDark,
    fontSize: 12,
  },
  photoDeleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  mapCard: {
    backgroundColor: '#B81D31',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  mapCoordinates: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 6,
  },
  mapNote: {
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 10,
    backgroundColor: '#F7B7BE',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: COLORS.backgroundDark,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  mapMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primaryBlue,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 4,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  submissionScroll: {
    padding: 16,
    paddingBottom: 32,
  },
  formRow: {
    marginBottom: 16,
  },
  formLabel: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 8,
  },
  dropdownInput: {
    minHeight: 46,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    paddingHorizontal: 12,
    color: COLORS.text,
  },
  segmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  segmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
    marginBottom: 8,
  },
  segmentOptionActive: {
    backgroundColor: COLORS.white,
  },
  segmentText: {
    color: COLORS.white,
    fontSize: 13,
  },
  segmentTextActive: {
    color: COLORS.backgroundDark,
    fontWeight: '700',
  },
  cameraMaskCard: {
    width: 96,
    height: 110,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraMaskIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  cameraMaskText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.white,
    fontSize: 16,
  },
});

export default App;
