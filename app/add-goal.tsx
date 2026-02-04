import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, GoalRecurrence, GoalPriority } from '../contexts/AppContext';
import Theme from '../constants/Theme';

const GOAL_TYPES = [
  { id: 'sales', name: 'Sales', icon: 'trending-up', color: Theme.colors.accent.primary },
  { id: 'personal', name: 'Personal', icon: 'heart', color: Theme.colors.purple.primary },
  { id: 'skill', name: 'Skill', icon: 'book', color: Theme.colors.warning },
];

const RECURRENCE_OPTIONS: { id: GoalRecurrence; label: string; icon: string }[] = [
  { id: 'none', label: 'One-time', icon: 'flag' },
  { id: 'daily', label: 'Daily', icon: 'sun' },
  { id: 'weekly', label: 'Weekly', icon: 'calendar' },
  { id: 'biweekly', label: 'Bi-weekly', icon: 'calendar' },
  { id: 'monthly', label: 'Monthly', icon: 'calendar' },
];

const PRIORITY_OPTIONS: { id: GoalPriority; label: string; color: string }[] = [
  { id: 'high', label: 'High', color: '#EF4444' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'low', label: 'Low', color: '#6B7280' },
];

const PRESET_GOALS = [
  { title: 'Close deals this month', type: 'sales', target: 10, unit: 'deals', days: 30, recurrence: 'monthly' as GoalRecurrence },
  { title: 'Make cold calls', type: 'sales', target: 50, unit: 'calls', days: 7, recurrence: 'weekly' as GoalRecurrence },
  { title: 'Practice objections', type: 'skill', target: 5, unit: 'practices', days: 1, recurrence: 'daily' as GoalRecurrence },
  { title: 'Chiron coaching sessions', type: 'skill', target: 3, unit: 'sessions', days: 7, recurrence: 'weekly' as GoalRecurrence },
  { title: 'Read a sales book', type: 'personal', target: 1, unit: 'books', days: 30, recurrence: 'monthly' as GoalRecurrence },
  { title: 'Follow up with leads', type: 'sales', target: 10, unit: 'follow-ups', days: 7, recurrence: 'weekly' as GoalRecurrence },
];

function buildCalendarMonth(monthOffset: number) {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const year = d.getFullYear();
  const month = d.getMonth();
  const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = d.getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { date: Date; label: string; isToday: boolean; isPast: boolean }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    date.setHours(0, 0, 0, 0);
    days.push({
      date,
      label: i.toString(),
      isToday: date.getTime() === today.getTime(),
      isPast: date < today,
    });
  }
  return { monthName, days, firstDayOfWeek };
}

export default function AddGoalScreen() {
  const { addGoal } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'sales' | 'personal' | 'skill'>('sales');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<GoalRecurrence>('none');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [datePickerMonth, setDatePickerMonth] = useState(0);

  const handlePresetSelect = (preset: typeof PRESET_GOALS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTitle(preset.title);
    setType(preset.type as any);
    setTarget(preset.target.toString());
    setUnit(preset.unit);
    setRecurrence(preset.recurrence);
    if (preset.recurrence === 'none') {
      const date = new Date(); date.setDate(date.getDate() + preset.days); setEndDate(date);
    } else { setEndDate(null); }
    setStartDate(null);
  };

  const openDatePicker = (which: 'start' | 'end') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDatePickerMonth(0);
    setShowDatePicker(which);
  };

  const handleDateSelect = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showDatePicker === 'start') {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
    } else {
      setEndDate(date);
      if (startDate && date < startDate) setStartDate(null);
    }
    setShowDatePicker(null);
  };

  const clearDate = (which: 'start' | 'end') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (which === 'start') setStartDate(null); else setEndDate(null);
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getDaysFromNow = (date: Date) => {
    const t = new Date(); t.setHours(0,0,0,0);
    const d = new Date(date); d.setHours(0,0,0,0);
    return Math.ceil((d.getTime() - t.getTime()) / 86400000);
  };

  const formatDaysLeft = (date: Date) => {
    const days = getDaysFromNow(date);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  };

  const handleSave = async () => {
    if (!title.trim() || !target || !unit.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addGoal({
      title: title.trim(), type,
      target: parseInt(target, 10), current: 0, unit: unit.trim(),
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      recurrence, recurringStreak: 0, priority, notes: notes.trim(), status: 'active',
    });
    const rl = recurrence !== 'none' ? ` (${recurrence})` : '';
    Alert.alert('🎯 Goal Created!', `"${title.trim()}"${rl}\nYou'll earn +15 XP when you complete it!`, [{ text: 'Let\'s Go!', onPress: () => router.back() }]);
  };

  const isValid = title.trim() && target && parseInt(target, 10) > 0 && unit.trim();
  const calMonth = showDatePicker ? buildCalendarMonth(datePickerMonth) : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.closeButton}><Feather name="x" size={22} color={Theme.colors.text.primary} /></Pressable>
            <Text style={styles.headerTitle}>New Goal</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* XP Banner */}
            <View style={styles.xpBanner}>
              <LinearGradient colors={['rgba(0,245,212,0.15)', 'rgba(139,92,246,0.1)']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.xpBannerGrad}>
                <Feather name="award" size={18} color={Theme.colors.accent.primary} />
                <Text style={styles.xpBannerText}>Earn <Text style={styles.xpHL}>+15 XP</Text> when you complete this goal!</Text>
              </LinearGradient>
            </View>

            {/* Quick Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QUICK PRESETS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {PRESET_GOALS.map((p, i) => (
                    <Pressable key={i} onPress={() => handlePresetSelect(p)} style={({pressed}) => [styles.presetChip, pressed && {opacity:0.7}]}>
                      <Text style={styles.presetText}>{p.title}</Text>
                      {p.recurrence !== 'none' && <View style={styles.presetBadge}><Text style={styles.presetBadgeText}>{p.recurrence}</Text></View>}
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Goal Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GOAL TYPE</Text>
              <View style={styles.typesRow}>
                {GOAL_TYPES.map((gt) => (
                  <Pressable key={gt.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setType(gt.id as any); }} style={[styles.typeCard, type === gt.id && {borderColor: gt.color}]}>
                    <Feather name={gt.icon as any} size={20} color={type === gt.id ? gt.color : Theme.colors.text.muted} />
                    <Text style={[styles.typeText, type === gt.id && {color: gt.color}]}>{gt.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GOAL TITLE</Text>
              <TextInput style={styles.input} placeholder="What do you want to achieve?" placeholderTextColor={Theme.colors.text.muted} value={title} onChangeText={setTitle} />
            </View>

            {/* Target */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TARGET</Text>
              <View style={styles.targetRow}>
                <TextInput style={[styles.input, styles.targetInput]} placeholder="10" placeholderTextColor={Theme.colors.text.muted} value={target} onChangeText={setTarget} keyboardType="number-pad" />
                <TextInput style={[styles.input, styles.unitInput]} placeholder="deals, calls, hours..." placeholderTextColor={Theme.colors.text.muted} value={unit} onChangeText={setUnit} />
              </View>
            </View>

            {/* Recurrence */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECURRENCE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {RECURRENCE_OPTIONS.map((o) => {
                    const a = recurrence === o.id;
                    return (
                      <Pressable key={o.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRecurrence(o.id); }} style={[styles.recChip, a && styles.recChipActive]}>
                        <Feather name={o.icon as any} size={14} color={a ? Theme.colors.background.primary : Theme.colors.text.muted} />
                        <Text style={[styles.recText, a && styles.recTextActive]}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              {recurrence !== 'none' && (
                <View style={styles.recHint}>
                  <Feather name="repeat" size={12} color={Theme.colors.accent.primary} />
                  <Text style={styles.recHintText}>Resets every {recurrence === 'biweekly' ? '2 weeks' : recurrence === 'daily' ? 'day' : recurrence}. Build a streak by completing on time!</Text>
                </View>
              )}
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PRIORITY</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_OPTIONS.map((o) => {
                  const a = priority === o.id;
                  return (
                    <Pressable key={o.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPriority(o.id); }} style={[styles.prioChip, a && {borderColor: o.color, backgroundColor: `${o.color}15`}]}>
                      <View style={[styles.prioDot, {backgroundColor: o.color}]} />
                      <Text style={[styles.prioText, a && {color: o.color}]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>START DATE (OPTIONAL)</Text>
              <Pressable onPress={() => openDatePicker('start')} style={({pressed}) => [styles.dateBtn, pressed && {opacity:0.7}]}>
                <Feather name="play-circle" size={18} color={startDate ? Theme.colors.success : Theme.colors.text.muted} />
                <Text style={[styles.dateBtnText, startDate && {color: Theme.colors.text.primary}]}>{startDate ? formatDate(startDate) : 'Starts immediately'}</Text>
                {startDate && <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>{getDaysFromNow(startDate) === 0 ? 'Today' : getDaysFromNow(startDate) > 0 ? `In ${getDaysFromNow(startDate)}d` : `${Math.abs(getDaysFromNow(startDate))}d ago`}</Text></View>}
                {startDate && <Pressable onPress={() => clearDate('start')} hitSlop={10} style={styles.dateClear}><Feather name="x" size={14} color={Theme.colors.text.muted} /></Pressable>}
              </Pressable>
            </View>

            {/* End Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>END DATE (OPTIONAL)</Text>
              <Pressable onPress={() => openDatePicker('end')} style={({pressed}) => [styles.dateBtn, pressed && {opacity:0.7}]}>
                <Feather name="calendar" size={18} color={endDate ? Theme.colors.accent.primary : Theme.colors.text.muted} />
                <Text style={[styles.dateBtnText, endDate && {color: Theme.colors.text.primary}]}>{endDate ? formatDate(endDate) : 'No deadline'}</Text>
                {endDate && <View style={[styles.dateBadge, getDaysFromNow(endDate) < 0 && {backgroundColor: 'rgba(239,68,68,0.15)'}]}><Text style={[styles.dateBadgeText, getDaysFromNow(endDate) < 0 && {color: '#EF4444'}]}>{formatDaysLeft(endDate)}</Text></View>}
                {endDate && <Pressable onPress={() => clearDate('end')} hitSlop={10} style={styles.dateClear}><Feather name="x" size={14} color={Theme.colors.text.muted} /></Pressable>}
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NOTES (OPTIONAL)</Text>
              <TextInput style={[styles.input, {minHeight: 80, paddingTop: 14}]} placeholder="Strategy, motivation, or reminders..." placeholderTextColor={Theme.colors.text.muted} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
            </View>

            {/* Save */}
            <Pressable onPress={handleSave} disabled={!isValid} style={({pressed}) => [styles.saveButton, !isValid && {opacity:0.6}, pressed && {opacity:0.9}]}>
              <LinearGradient colors={isValid ? Theme.gradients.primary : [Theme.colors.background.card, Theme.colors.background.card]} style={styles.saveGrad}>
                <Feather name="flag" size={18} color={isValid ? Theme.colors.background.primary : Theme.colors.text.muted} />
                <Text style={[styles.saveText, !isValid && {color: Theme.colors.text.muted}]}>Create Goal</Text>
              </LinearGradient>
            </Pressable>
            <View style={{height: 40}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Calendar Picker */}
      <Modal visible={showDatePicker !== null} animationType="fade" transparent>
        <Pressable style={styles.overlay} onPress={() => setShowDatePicker(null)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>{showDatePicker === 'start' ? 'Start Date' : 'End Date'}</Text>
            <View style={styles.monthNav}>
              <Pressable onPress={() => setDatePickerMonth(p => p-1)} style={styles.monthBtn}><Feather name="chevron-left" size={20} color={Theme.colors.text.primary} /></Pressable>
              <Text style={styles.monthLabel}>{calMonth?.monthName}</Text>
              <Pressable onPress={() => setDatePickerMonth(p => p+1)} style={styles.monthBtn}><Feather name="chevron-right" size={20} color={Theme.colors.text.primary} /></Pressable>
            </View>
            <View style={styles.dayHeaders}>{['S','M','T','W','T','F','S'].map((d,i) => <Text key={i} style={styles.dayH}>{d}</Text>)}</View>
            <View style={styles.calGrid}>
              {calMonth && Array.from({length: calMonth.firstDayOfWeek}).map((_,i) => <View key={`e${i}`} style={styles.calCell} />)}
              {calMonth?.days.map((day) => {
                const sel = showDatePicker === 'start'
                  ? startDate && day.date.toDateString() === startDate.toDateString()
                  : endDate && day.date.toDateString() === endDate.toDateString();
                return (
                  <Pressable key={day.label} onPress={() => handleDateSelect(day.date)} style={[styles.calCell, sel && styles.calCellSel]}>
                    <Text style={[styles.calCellText, day.isToday && styles.calToday, sel && styles.calCellTextSel]}>{day.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.quickRow}>
              {[{l:'Today',d:0},{l:'Tomorrow',d:1},{l:'+1 Week',d:7},{l:'+1 Month',d:30}].map(p => (
                <Pressable key={p.l} onPress={() => {const dd=new Date(); dd.setDate(dd.getDate()+p.d); handleDateSelect(dd);}} style={styles.quickChip}><Text style={styles.quickText}>{p.l}</Text></Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowDatePicker(null)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1}, safeArea: {flex:1}, keyboardView: {flex:1}, scrollView: {flex:1}, scrollContent: {padding:20, paddingBottom:40},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:12},
  closeButton: {width:40, height:40, borderRadius:20, backgroundColor:Theme.colors.background.card, alignItems:'center', justifyContent:'center'},
  headerTitle: {fontSize:18, fontWeight:'700', color:Theme.colors.text.primary}, placeholder: {width:40},
  xpBanner: {marginBottom:20, borderRadius:16, overflow:'hidden'},
  xpBannerGrad: {flexDirection:'row', alignItems:'center', gap:10, padding:14},
  xpBannerText: {fontSize:13, color:Theme.colors.text.secondary}, xpHL: {color:Theme.colors.accent.primary, fontWeight:'700'},
  section: {marginBottom:20}, sectionTitle: {fontSize:11, fontWeight:'600', color:Theme.colors.text.tertiary, letterSpacing:1, marginBottom:10},
  row: {flexDirection:'row', gap:8, paddingRight:20},
  presetChip: {backgroundColor:Theme.colors.background.card, paddingHorizontal:14, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:Theme.colors.border.primary, flexDirection:'row', alignItems:'center', gap:6},
  presetText: {fontSize:13, color:Theme.colors.text.secondary},
  presetBadge: {backgroundColor:'rgba(0,245,212,0.15)', paddingHorizontal:6, paddingVertical:2, borderRadius:6},
  presetBadgeText: {fontSize:9, fontWeight:'700', color:Theme.colors.accent.primary, textTransform:'uppercase'},
  typesRow: {flexDirection:'row', gap:10},
  typeCard: {flex:1, alignItems:'center', backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, borderWidth:2, borderColor:Theme.colors.border.primary},
  typeText: {fontSize:12, fontWeight:'600', color:Theme.colors.text.muted, marginTop:8},
  input: {backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, fontSize:15, color:Theme.colors.text.primary, borderWidth:1, borderColor:Theme.colors.border.primary},
  targetRow: {flexDirection:'row', gap:10}, targetInput: {width:80, textAlign:'center'}, unitInput: {flex:1},
  recChip: {flexDirection:'row', alignItems:'center', gap:6, backgroundColor:Theme.colors.background.card, paddingHorizontal:14, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:Theme.colors.border.primary},
  recChipActive: {backgroundColor:Theme.colors.accent.primary, borderColor:Theme.colors.accent.primary},
  recText: {fontSize:13, fontWeight:'600', color:Theme.colors.text.secondary}, recTextActive: {color:Theme.colors.background.primary},
  recHint: {flexDirection:'row', alignItems:'center', gap:6, marginTop:10, paddingHorizontal:4},
  recHintText: {fontSize:12, color:Theme.colors.text.tertiary, flex:1},
  priorityRow: {flexDirection:'row', gap:10},
  prioChip: {flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:Theme.colors.background.card, paddingVertical:12, borderRadius:14, borderWidth:2, borderColor:Theme.colors.border.primary},
  prioDot: {width:8, height:8, borderRadius:4}, prioText: {fontSize:13, fontWeight:'600', color:Theme.colors.text.muted},
  dateBtn: {flexDirection:'row', alignItems:'center', backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, borderWidth:1, borderColor:Theme.colors.border.primary, gap:10},
  dateBtnText: {flex:1, fontSize:15, color:Theme.colors.text.muted},
  dateBadge: {backgroundColor:Theme.colors.accent.muted, paddingHorizontal:10, paddingVertical:4, borderRadius:10},
  dateBadgeText: {fontSize:11, color:Theme.colors.accent.primary, fontWeight:'600'},
  dateClear: {width:24, height:24, borderRadius:12, backgroundColor:Theme.colors.background.elevated, alignItems:'center', justifyContent:'center'},
  saveButton: {borderRadius:20, overflow:'hidden', marginTop:10},
  saveGrad: {flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:18},
  saveText: {fontSize:16, fontWeight:'700', color:Theme.colors.background.primary},
  // Modal
  overlay: {flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center', alignItems:'center', padding:20},
  modal: {backgroundColor:Theme.colors.background.elevated, borderRadius:24, padding:20, width:'100%', maxWidth:360},
  modalTitle: {fontSize:20, fontWeight:'700', color:Theme.colors.text.primary, textAlign:'center', marginBottom:16},
  monthNav: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12},
  monthBtn: {width:36, height:36, borderRadius:18, backgroundColor:Theme.colors.background.card, alignItems:'center', justifyContent:'center'},
  monthLabel: {fontSize:16, fontWeight:'700', color:Theme.colors.text.primary},
  dayHeaders: {flexDirection:'row', marginBottom:4},
  dayH: {width:'14.28%', textAlign:'center', fontSize:11, fontWeight:'600', color:Theme.colors.text.muted, paddingVertical:4} as any,
  calGrid: {flexDirection:'row', flexWrap:'wrap'},
  calCell: {width:'14.28%', aspectRatio:1, alignItems:'center', justifyContent:'center', borderRadius:8} as any,
  calCellSel: {backgroundColor:Theme.colors.accent.primary},
  calCellText: {fontSize:14, color:Theme.colors.text.primary, fontWeight:'500'},
  calToday: {color:Theme.colors.accent.primary, fontWeight:'800'},
  calCellTextSel: {color:Theme.colors.background.primary, fontWeight:'700'},
  quickRow: {flexDirection:'row', gap:8, marginTop:12, marginBottom:16},
  quickChip: {flex:1, backgroundColor:Theme.colors.background.card, paddingVertical:8, borderRadius:10, alignItems:'center'},
  quickText: {fontSize:12, fontWeight:'600', color:Theme.colors.text.secondary},
  cancelBtn: {paddingVertical:14, borderRadius:16, alignItems:'center', backgroundColor:Theme.colors.background.card},
  cancelText: {fontSize:14, fontWeight:'600', color:Theme.colors.text.secondary},
});
