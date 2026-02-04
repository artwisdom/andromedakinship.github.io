import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

function buildCalendarMonth(monthOffset: number) {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = d.getDay();
  const today = new Date(); today.setHours(0,0,0,0);
  const days: { date: Date; label: string; isToday: boolean }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(d.getFullYear(), d.getMonth(), i); date.setHours(0,0,0,0);
    days.push({ date, label: i.toString(), isToday: date.getTime() === today.getTime() });
  }
  return { monthName, days, firstDayOfWeek };
}

export default function EditGoalScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { state, updateGoal, deleteGoal, addXP, pauseGoal, resumeGoal } = useApp();
  const goal = state.goals.find(g => g.id === goalId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'sales' | 'personal' | 'skill'>('sales');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [unit, setUnit] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<GoalRecurrence>('none');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [datePickerMonth, setDatePickerMonth] = useState(0);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title); setType(goal.type);
      setTarget(goal.target.toString()); setCurrent(goal.current.toString());
      setUnit(goal.unit); setNotes(goal.notes || '');
      setStartDate(goal.startDate ? new Date(goal.startDate) : null);
      setEndDate(goal.endDate ? new Date(goal.endDate) : null);
      setRecurrence(goal.recurrence || 'none');
      setPriority(goal.priority || 'medium');
    }
  }, [goal]);

  if (!goal) {
    return (
      <View style={styles.container}><LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safeArea}><View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
          <Text style={{color: Theme.colors.text.primary, fontSize: 18}}>Goal not found</Text>
          <Pressable onPress={() => router.back()} style={{marginTop: 20}}><Text style={{color: Theme.colors.accent.primary}}>Go Back</Text></Pressable>
        </View></SafeAreaView>
      </View>
    );
  }

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const getDaysFromNow = (date: Date) => { const t = new Date(); t.setHours(0,0,0,0); const d = new Date(date); d.setHours(0,0,0,0); return Math.ceil((d.getTime() - t.getTime()) / 86400000); };
  const formatDaysLeft = (date: Date) => {
    const days = getDaysFromNow(date);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  };

  const handleDateSelect = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showDatePicker === 'start') { setStartDate(date); if (endDate && date > endDate) setEndDate(null); }
    else { setEndDate(date); if (startDate && date < startDate) setStartDate(null); }
    setShowDatePicker(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !target || !unit.trim() || !goalId) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const targetNum = parseInt(target, 10);
    const currentNum = parseInt(current, 10) || 0;
    const wasCompleted = goal.status === 'completed';
    const isNowCompleted = currentNum >= targetNum && recurrence === 'none';

    updateGoal(goalId, {
      title: title.trim(), type,
      target: targetNum, current: Math.min(currentNum, targetNum * 2), unit: unit.trim(),
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      recurrence, priority, notes: notes.trim(),
      status: isNowCompleted ? 'completed' : (goal.status === 'paused' ? 'paused' : 'active'),
    });

    if (!wasCompleted && isNowCompleted) { addXP(15); }
    Alert.alert('✅ Goal Updated', 'Your changes have been saved.', [{ text: 'Done', onPress: () => router.back() }]);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Delete Goal', `Delete "${goal.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteGoal(goalId!); router.back(); } },
    ]);
  };

  const handlePauseToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (goal.status === 'paused') { resumeGoal(goalId!); }
    else { pauseGoal(goalId!); }
  };

  const isValid = title.trim() && target && parseInt(target, 10) > 0 && unit.trim();
  const calMonth = showDatePicker ? buildCalendarMonth(datePickerMonth) : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.closeButton}><Feather name="x" size={22} color={Theme.colors.text.primary} /></Pressable>
            <Text style={styles.headerTitle}>Edit Goal</Text>
            <Pressable onPress={handleDelete} style={styles.deleteBtn}><Feather name="trash-2" size={18} color={Theme.colors.error} /></Pressable>
          </View>

          <ScrollView style={{flex:1}} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Status + Recurring Streak Banner */}
            <View style={styles.statusBanner}>
              <View style={[styles.statusBadge, goal.status === 'paused' && {backgroundColor: 'rgba(245,158,11,0.15)'}, goal.status === 'completed' && {backgroundColor: 'rgba(16,185,129,0.15)'}, goal.status === 'overdue' && {backgroundColor: 'rgba(239,68,68,0.15)'}]}>
                <Feather name={goal.status === 'paused' ? 'pause-circle' : goal.status === 'completed' ? 'check-circle' : goal.status === 'overdue' ? 'alert-circle' : goal.status === 'upcoming' ? 'clock' : 'play-circle'} size={14} color={goal.status === 'paused' ? Theme.colors.warning : goal.status === 'completed' ? Theme.colors.success : goal.status === 'overdue' ? Theme.colors.error : Theme.colors.accent.primary} />
                <Text style={[styles.statusText, goal.status === 'paused' && {color: Theme.colors.warning}, goal.status === 'completed' && {color: Theme.colors.success}, goal.status === 'overdue' && {color: Theme.colors.error}]}>{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}</Text>
              </View>
              {(goal.recurrence || 'none') !== 'none' && (goal.recurringStreak || 0) > 0 && (
                <View style={styles.streakBadge}><Text style={styles.streakText}>🔥 {goal.recurringStreak} streak</Text></View>
              )}
              <View style={{flex:1}} />
              {goal.status !== 'completed' && (
                <Pressable onPress={handlePauseToggle} style={styles.pauseBtn}>
                  <Feather name={goal.status === 'paused' ? 'play' : 'pause'} size={14} color={Theme.colors.text.secondary} />
                  <Text style={styles.pauseBtnText}>{goal.status === 'paused' ? 'Resume' : 'Pause'}</Text>
                </Pressable>
              )}
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
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={Theme.colors.text.muted} />
            </View>

            {/* Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROGRESS</Text>
              <View style={styles.targetRow}>
                <View style={{alignItems:'center'}}>
                  <Text style={styles.fieldLabel}>Current</Text>
                  <TextInput style={[styles.input, styles.numInput]} value={current} onChangeText={setCurrent} keyboardType="number-pad" />
                </View>
                <Text style={styles.ofText}>of</Text>
                <View style={{alignItems:'center'}}>
                  <Text style={styles.fieldLabel}>Target</Text>
                  <TextInput style={[styles.input, styles.numInput]} value={target} onChangeText={setTarget} keyboardType="number-pad" />
                </View>
                <TextInput style={[styles.input, {flex:1}]} placeholder="unit" value={unit} onChangeText={setUnit} placeholderTextColor={Theme.colors.text.muted} />
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
              <Text style={styles.sectionTitle}>START DATE</Text>
              <Pressable onPress={() => { setDatePickerMonth(0); setShowDatePicker('start'); }} style={styles.dateBtn}>
                <Feather name="play-circle" size={18} color={startDate ? Theme.colors.success : Theme.colors.text.muted} />
                <Text style={[styles.dateBtnText, startDate && {color: Theme.colors.text.primary}]}>{startDate ? formatDate(startDate) : 'Not set'}</Text>
                {startDate && <Pressable onPress={() => setStartDate(null)} hitSlop={10} style={styles.dateClear}><Feather name="x" size={14} color={Theme.colors.text.muted} /></Pressable>}
              </Pressable>
            </View>

            {/* End Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>END DATE</Text>
              <Pressable onPress={() => { setDatePickerMonth(0); setShowDatePicker('end'); }} style={styles.dateBtn}>
                <Feather name="calendar" size={18} color={endDate ? Theme.colors.accent.primary : Theme.colors.text.muted} />
                <Text style={[styles.dateBtnText, endDate && {color: Theme.colors.text.primary}]}>{endDate ? formatDate(endDate) : 'No deadline'}</Text>
                {endDate && <View style={[styles.dateBadge, getDaysFromNow(endDate) < 0 && {backgroundColor: 'rgba(239,68,68,0.15)'}]}><Text style={[styles.dateBadgeText, getDaysFromNow(endDate) < 0 && {color: '#EF4444'}]}>{formatDaysLeft(endDate)}</Text></View>}
                {endDate && <Pressable onPress={() => setEndDate(null)} hitSlop={10} style={styles.dateClear}><Feather name="x" size={14} color={Theme.colors.text.muted} /></Pressable>}
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NOTES</Text>
              <TextInput style={[styles.input, {minHeight:80, paddingTop:14}]} placeholder="Strategy, motivation, or reminders..." placeholderTextColor={Theme.colors.text.muted} value={notes} onChangeText={setNotes} multiline numberOfLines={3} textAlignVertical="top" />
            </View>

            {/* Save */}
            <Pressable onPress={handleSave} disabled={!isValid} style={({pressed}) => [{borderRadius:20, overflow:'hidden', marginTop:10}, !isValid && {opacity:0.6}, pressed && {opacity:0.9}]}>
              <LinearGradient colors={isValid ? Theme.gradients.primary : [Theme.colors.background.card, Theme.colors.background.card]} style={styles.saveGrad}>
                <Feather name="check" size={18} color={isValid ? Theme.colors.background.primary : Theme.colors.text.muted} />
                <Text style={[styles.saveText, !isValid && {color: Theme.colors.text.muted}]}>Save Changes</Text>
              </LinearGradient>
            </Pressable>
            <View style={{height:40}} />
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
                const sel = showDatePicker === 'start' ? startDate && day.date.toDateString() === startDate.toDateString() : endDate && day.date.toDateString() === endDate.toDateString();
                return (
                  <Pressable key={day.label} onPress={() => handleDateSelect(day.date)} style={[styles.calCell, sel && styles.calCellSel]}>
                    <Text style={[styles.calCellText, day.isToday && styles.calToday, sel && styles.calCellTextSel]}>{day.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setShowDatePicker(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1}, safeArea: {flex:1}, scrollContent: {padding:20, paddingBottom:40},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:12},
  closeButton: {width:40, height:40, borderRadius:20, backgroundColor:Theme.colors.background.card, alignItems:'center', justifyContent:'center'},
  headerTitle: {fontSize:18, fontWeight:'700', color:Theme.colors.text.primary},
  deleteBtn: {width:40, height:40, borderRadius:20, backgroundColor:'rgba(239,68,68,0.1)', alignItems:'center', justifyContent:'center'},
  statusBanner: {flexDirection:'row', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap'},
  statusBadge: {flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(0,245,212,0.15)', paddingHorizontal:12, paddingVertical:6, borderRadius:20},
  statusText: {fontSize:13, fontWeight:'600', color:Theme.colors.accent.primary},
  streakBadge: {backgroundColor:'rgba(245,158,11,0.15)', paddingHorizontal:10, paddingVertical:5, borderRadius:16},
  streakText: {fontSize:12, fontWeight:'700', color:Theme.colors.warning},
  pauseBtn: {flexDirection:'row', alignItems:'center', gap:4, backgroundColor:Theme.colors.background.card, paddingHorizontal:12, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor:Theme.colors.border.primary},
  pauseBtnText: {fontSize:12, fontWeight:'600', color:Theme.colors.text.secondary},
  section: {marginBottom:20}, sectionTitle: {fontSize:11, fontWeight:'600', color:Theme.colors.text.tertiary, letterSpacing:1, marginBottom:10},
  row: {flexDirection:'row', gap:8, paddingRight:20},
  typesRow: {flexDirection:'row', gap:10},
  typeCard: {flex:1, alignItems:'center', backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, borderWidth:2, borderColor:Theme.colors.border.primary},
  typeText: {fontSize:12, fontWeight:'600', color:Theme.colors.text.muted, marginTop:8},
  input: {backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, fontSize:15, color:Theme.colors.text.primary, borderWidth:1, borderColor:Theme.colors.border.primary},
  targetRow: {flexDirection:'row', gap:10, alignItems:'flex-end'},
  numInput: {width:70, textAlign:'center'},
  fieldLabel: {fontSize:10, color:Theme.colors.text.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:0.5},
  ofText: {fontSize:14, color:Theme.colors.text.muted, paddingBottom:18},
  recChip: {flexDirection:'row', alignItems:'center', gap:6, backgroundColor:Theme.colors.background.card, paddingHorizontal:14, paddingVertical:10, borderRadius:20, borderWidth:1, borderColor:Theme.colors.border.primary},
  recChipActive: {backgroundColor:Theme.colors.accent.primary, borderColor:Theme.colors.accent.primary},
  recText: {fontSize:13, fontWeight:'600', color:Theme.colors.text.secondary}, recTextActive: {color:Theme.colors.background.primary},
  priorityRow: {flexDirection:'row', gap:10},
  prioChip: {flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:Theme.colors.background.card, paddingVertical:12, borderRadius:14, borderWidth:2, borderColor:Theme.colors.border.primary},
  prioDot: {width:8, height:8, borderRadius:4}, prioText: {fontSize:13, fontWeight:'600', color:Theme.colors.text.muted},
  dateBtn: {flexDirection:'row', alignItems:'center', backgroundColor:Theme.colors.background.card, borderRadius:16, padding:16, borderWidth:1, borderColor:Theme.colors.border.primary, gap:10},
  dateBtnText: {flex:1, fontSize:15, color:Theme.colors.text.muted},
  dateBadge: {backgroundColor:Theme.colors.accent.muted, paddingHorizontal:10, paddingVertical:4, borderRadius:10},
  dateBadgeText: {fontSize:11, color:Theme.colors.accent.primary, fontWeight:'600'},
  dateClear: {width:24, height:24, borderRadius:12, backgroundColor:Theme.colors.background.elevated, alignItems:'center', justifyContent:'center'},
  saveGrad: {flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:18},
  saveText: {fontSize:16, fontWeight:'700', color:Theme.colors.background.primary},
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
  cancelBtn: {paddingVertical:14, borderRadius:16, alignItems:'center', backgroundColor:Theme.colors.background.card, marginTop:12},
  cancelBtnText: {fontSize:14, fontWeight:'600', color:Theme.colors.text.secondary},
});
