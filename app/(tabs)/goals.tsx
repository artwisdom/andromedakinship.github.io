import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, Goal, GoalStatus } from '../../contexts/AppContext';
import Theme from '../../constants/Theme';

type Filter = 'all' | 'active' | 'upcoming' | 'completed' | 'paused';

const PRIORITY_COLORS: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };
const STATUS_CONFIG: Record<GoalStatus, { icon: string; color: string; label: string }> = {
  active: { icon: 'play-circle', color: Theme.colors.accent.primary, label: 'Active' },
  upcoming: { icon: 'clock', color: Theme.colors.blue.primary, label: 'Upcoming' },
  paused: { icon: 'pause-circle', color: Theme.colors.warning, label: 'Paused' },
  completed: { icon: 'check-circle', color: Theme.colors.success, label: 'Completed' },
  overdue: { icon: 'alert-circle', color: Theme.colors.error, label: 'Overdue' },
};
const RECURRENCE_LABELS: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' };

export default function GoalsScreen() {
  const { state, deleteGoal, incrementGoalProgress, pauseGoal, resumeGoal } = useApp();
  const { goals } = state;
  const [filter, setFilter] = useState<Filter>('all');

  const filteredGoals = filter === 'all' ? goals : goals.filter(g => {
    if (filter === 'active') return g.status === 'active' || g.status === 'overdue';
    return g.status === filter;
  });

  // Sort: high priority first, then active, overdue, upcoming, paused, completed
  const sorted = [...filteredGoals].sort((a, b) => {
    const statusOrder: Record<string, number> = { overdue: 0, active: 1, upcoming: 2, paused: 3, completed: 4 };
    const prioOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const sd = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    if (sd !== 0) return sd;
    return (prioOrder[a.priority || 'medium'] || 1) - (prioOrder[b.priority || 'medium'] || 1);
  });

  const counts = {
    all: goals.length,
    active: goals.filter(g => g.status === 'active' || g.status === 'overdue').length,
    upcoming: goals.filter(g => g.status === 'upcoming').length,
    completed: goals.filter(g => g.status === 'completed').length,
    paused: goals.filter(g => g.status === 'paused').length,
  };

  const completionRate = goals.length > 0 ? Math.round((counts.completed / goals.length) * 100) : 0;
  const totalRecurringStreak = goals.reduce((s, g) => s + (g.recurringStreak || 0), 0);

  const getTypeColor = (type: Goal['type']) => {
    switch (type) { case 'sales': return Theme.colors.accent.primary; case 'personal': return Theme.colors.purple.primary; case 'skill': return Theme.colors.warning; }
  };
  const getTypeIcon = (type: Goal['type']): string => {
    switch (type) { case 'sales': return 'trending-up'; case 'personal': return 'heart'; case 'skill': return 'book'; }
  };

  const handleIncrement = async (goal: Goal) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (goal.current < goal.target) incrementGoalProgress(goal.id);
  };

  const handleDelete = async (goal: Goal) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Delete Goal', `Delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goal.id) },
    ]);
  };

  const formatShortDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filters: Filter[] = ['all', 'active', 'upcoming', 'completed', 'paused'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Theme.colors.background.primary, Theme.colors.background.secondary]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Goals</Text>
              <Text style={styles.subtitle}>Track your progress</Text>
            </View>
            <Pressable onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-goal'); }} style={({pressed}) => [styles.addButton, pressed && {opacity:0.8, transform:[{scale:0.95}]}]}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.addButtonGrad}><Feather name="plus" size={22} color={Theme.colors.background.primary} /></LinearGradient>
            </Pressable>
          </View>

          {/* Stats Overview */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBlock}><Text style={styles.statValue}>{counts.active}</Text><Text style={styles.statLabel}>Active</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}><Text style={[styles.statValue, {color: Theme.colors.success}]}>{counts.completed}</Text><Text style={styles.statLabel}>Done</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}><Text style={[styles.statValue, {color: Theme.colors.accent.primary}]}>{completionRate}%</Text><Text style={styles.statLabel}>Rate</Text></View>
              {totalRecurringStreak > 0 && (<>
                <View style={styles.statDivider} />
                <View style={styles.statBlock}><Text style={[styles.statValue, {color: Theme.colors.warning}]}>🔥{totalRecurringStreak}</Text><Text style={styles.statLabel}>Streaks</Text></View>
              </>)}
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
            <View style={styles.filterRow}>
              {filters.map((f) => (
                <Pressable key={f} onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f); }} style={[styles.filterTab, filter === f && styles.filterTabActive]}>
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} {counts[f] > 0 ? `(${counts[f]})` : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Goals List */}
          {sorted.length > 0 ? (
            <View style={styles.goalsList}>
              {sorted.map((goal, index) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                const color = getTypeColor(goal.type);
                const status = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active;
                const prioColor = PRIORITY_COLORS[goal.priority || 'medium'];
                const isComplete = goal.status === 'completed';
                const isPaused = goal.status === 'paused';
                const rec = goal.recurrence && goal.recurrence !== 'none' ? RECURRENCE_LABELS[goal.recurrence] : null;

                let daysLeft: number | null = null;
                let isOverdue = false;
                if (goal.endDate) {
                  const today = new Date(); today.setHours(0,0,0,0);
                  const end = new Date(goal.endDate); end.setHours(0,0,0,0);
                  daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);
                  isOverdue = daysLeft < 0;
                }

                return (
                  <Pressable key={`goal-${goal.id}-${index}`} onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push({ pathname: '/edit-goal', params: { goalId: goal.id } }); }} style={({pressed}) => [styles.goalCard, isPaused && {opacity: 0.6}, pressed && {opacity: 0.8}]}>
                    {/* Priority stripe */}
                    <View style={[styles.prioStripe, {backgroundColor: prioColor}]} />

                    <View style={styles.goalInner}>
                      {/* Header row */}
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalIcon, {backgroundColor: `${color}15`}]}>
                          <Feather name={getTypeIcon(goal.type) as any} size={18} color={color} />
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={[styles.goalTitle, isComplete && styles.goalTitleDone]}>{goal.title}</Text>
                          {/* Tags row */}
                          <View style={styles.tagsRow}>
                            {/* Status badge */}
                            <View style={[styles.statusBadge, {backgroundColor: `${status.color}15`}]}>
                              <Feather name={status.icon as any} size={10} color={status.color} />
                              <Text style={[styles.statusText, {color: status.color}]}>{status.label}</Text>
                            </View>
                            {/* Recurrence badge */}
                            {rec && (
                              <View style={styles.recBadge}>
                                <Feather name="repeat" size={9} color={Theme.colors.accent.primary} />
                                <Text style={styles.recBadgeText}>{rec}</Text>
                              </View>
                            )}
                            {/* Recurring streak */}
                            {(goal.recurringStreak || 0) > 0 && (
                              <View style={styles.streakBadge}><Text style={styles.streakBadgeText}>🔥{goal.recurringStreak}</Text></View>
                            )}
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.goalActions}>
                          {goal.status === 'active' && goal.current < goal.target && (
                            <Pressable onPress={(e) => { e.stopPropagation?.(); handleIncrement(goal); }} style={({pressed}) => [styles.actionBtn, styles.incBtn, pressed && {opacity:0.7}]}>
                              <Feather name="plus" size={16} color={Theme.colors.accent.primary} />
                            </Pressable>
                          )}
                          {(goal.status === 'active' || goal.status === 'overdue') && (
                            <Pressable onPress={async (e) => { e.stopPropagation?.(); await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); pauseGoal(goal.id); }} style={({pressed}) => [styles.actionBtn, pressed && {opacity:0.7}]}>
                              <Feather name="pause" size={14} color={Theme.colors.text.tertiary} />
                            </Pressable>
                          )}
                          {isPaused && (
                            <Pressable onPress={async (e) => { e.stopPropagation?.(); await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); resumeGoal(goal.id); }} style={({pressed}) => [styles.actionBtn, styles.incBtn, pressed && {opacity:0.7}]}>
                              <Feather name="play" size={14} color={Theme.colors.accent.primary} />
                            </Pressable>
                          )}
                        </View>
                      </View>

                      {/* Dates row */}
                      {(goal.startDate || goal.endDate) && (
                        <View style={styles.datesRow}>
                          {goal.startDate && (
                            <View style={styles.dateChip}>
                              <Feather name="play-circle" size={10} color={Theme.colors.text.muted} />
                              <Text style={styles.dateChipText}>{formatShortDate(goal.startDate)}</Text>
                            </View>
                          )}
                          {goal.startDate && goal.endDate && <Feather name="arrow-right" size={10} color={Theme.colors.text.muted} />}
                          {goal.endDate && (
                            <View style={[styles.dateChip, isOverdue && {backgroundColor: 'rgba(239,68,68,0.15)'}, daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && {backgroundColor: 'rgba(245,158,11,0.15)'}]}>
                              <Feather name="calendar" size={10} color={isOverdue ? Theme.colors.error : daysLeft !== null && daysLeft <= 3 ? Theme.colors.warning : Theme.colors.text.muted} />
                              <Text style={[styles.dateChipText, isOverdue && {color: Theme.colors.error}, daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && {color: Theme.colors.warning}]}>
                                {isOverdue ? 'Overdue!' : daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1d left' : `${daysLeft}d left`}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Progress */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <LinearGradient colors={isComplete ? [Theme.colors.success, Theme.colors.success] : [color, color]} style={[styles.progressFill, {width: `${Math.min(progress, 100)}%`}]} />
                        </View>
                        <Text style={styles.progressText}>{goal.current}/{goal.target} {goal.unit}</Text>
                      </View>

                      {/* Notes preview */}
                      {goal.notes && goal.notes.length > 0 && (
                        <View style={styles.notesPreview}>
                          <Feather name="file-text" size={10} color={Theme.colors.text.muted} />
                          <Text style={styles.notesText} numberOfLines={1}>{goal.notes}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><Feather name="flag" size={40} color={Theme.colors.text.muted} /></View>
              <Text style={styles.emptyTitle}>{filter === 'all' ? 'No goals yet' : `No ${filter} goals`}</Text>
              <Text style={styles.emptySubtitle}>{filter === 'all' ? 'Create your first goal to start tracking' : 'Check other tabs or create a new goal'}</Text>
              {filter === 'all' && (
                <Pressable onPress={() => router.push('/add-goal')} style={styles.emptyButton}>
                  <LinearGradient colors={Theme.gradients.primary} style={styles.emptyButtonGrad}>
                    <Feather name="plus" size={18} color={Theme.colors.background.primary} />
                    <Text style={styles.emptyButtonText}>Create Goal</Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:Theme.colors.background.primary}, safeArea: {flex:1}, scrollView: {flex:1},
  scrollContent: {paddingHorizontal:20, paddingTop:8},
  header: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20},
  title: {...Theme.typography.headline.h1, color:Theme.colors.text.primary},
  subtitle: {fontSize:14, color:Theme.colors.text.tertiary, marginTop:4},
  addButton: {borderRadius:14, overflow:'hidden'},
  addButtonGrad: {width:48, height:48, alignItems:'center', justifyContent:'center'},
  statsCard: {backgroundColor:Theme.colors.background.card, borderRadius:Theme.radius.xl, padding:20, marginBottom:16, borderWidth:1, borderColor:Theme.colors.border.primary},
  statsRow: {flexDirection:'row'}, statBlock: {flex:1, alignItems:'center'},
  statDivider: {width:1, backgroundColor:Theme.colors.border.primary, marginVertical:4},
  statValue: {fontSize:24, fontWeight:'800', color:Theme.colors.text.primary},
  statLabel: {fontSize:10, color:Theme.colors.text.tertiary, marginTop:4, textTransform:'uppercase', letterSpacing:0.5},
  filterRow: {flexDirection:'row', gap:6, paddingRight:20},
  filterTab: {paddingHorizontal:16, paddingVertical:8, borderRadius:20, backgroundColor:Theme.colors.background.card, borderWidth:1, borderColor:Theme.colors.border.primary},
  filterTabActive: {backgroundColor:Theme.colors.accent.primary, borderColor:Theme.colors.accent.primary},
  filterText: {fontSize:13, fontWeight:'600', color:Theme.colors.text.tertiary},
  filterTextActive: {color:Theme.colors.background.primary},
  goalsList: {gap:12},
  goalCard: {backgroundColor:Theme.colors.background.card, borderRadius:Theme.radius.lg, overflow:'hidden', borderWidth:1, borderColor:Theme.colors.border.primary, flexDirection:'row'},
  prioStripe: {width:4, borderTopLeftRadius:Theme.radius.lg, borderBottomLeftRadius:Theme.radius.lg},
  goalInner: {flex:1, padding:14},
  goalHeader: {flexDirection:'row', alignItems:'flex-start'},
  goalIcon: {width:38, height:38, borderRadius:11, alignItems:'center', justifyContent:'center', marginRight:10},
  goalInfo: {flex:1},
  goalTitle: {fontSize:15, fontWeight:'600', color:Theme.colors.text.primary},
  goalTitleDone: {textDecorationLine:'line-through', color:Theme.colors.text.muted},
  tagsRow: {flexDirection:'row', gap:6, marginTop:6, flexWrap:'wrap'},
  statusBadge: {flexDirection:'row', alignItems:'center', gap:3, paddingHorizontal:7, paddingVertical:2, borderRadius:8},
  statusText: {fontSize:10, fontWeight:'600'},
  recBadge: {flexDirection:'row', alignItems:'center', gap:3, backgroundColor:'rgba(0,245,212,0.1)', paddingHorizontal:7, paddingVertical:2, borderRadius:8},
  recBadgeText: {fontSize:10, fontWeight:'600', color:Theme.colors.accent.primary},
  streakBadge: {backgroundColor:'rgba(245,158,11,0.1)', paddingHorizontal:7, paddingVertical:2, borderRadius:8},
  streakBadgeText: {fontSize:10, fontWeight:'700', color:Theme.colors.warning},
  goalActions: {flexDirection:'row', gap:6, marginLeft:6},
  actionBtn: {width:30, height:30, borderRadius:8, backgroundColor:Theme.colors.background.elevated, alignItems:'center', justifyContent:'center'},
  incBtn: {backgroundColor:Theme.colors.accent.subtle},
  datesRow: {flexDirection:'row', alignItems:'center', gap:6, marginTop:8},
  dateChip: {flexDirection:'row', alignItems:'center', gap:4, backgroundColor:Theme.colors.background.elevated, paddingHorizontal:8, paddingVertical:3, borderRadius:8},
  dateChipText: {fontSize:11, color:Theme.colors.text.muted, fontWeight:'500'},
  progressContainer: {marginTop:10},
  progressBar: {height:6, backgroundColor:Theme.colors.border.primary, borderRadius:3, overflow:'hidden', marginBottom:6},
  progressFill: {height:'100%', borderRadius:3},
  progressText: {fontSize:11, color:Theme.colors.text.tertiary, textAlign:'right'},
  notesPreview: {flexDirection:'row', alignItems:'center', gap:6, marginTop:8, paddingTop:8, borderTopWidth:1, borderTopColor:Theme.colors.border.secondary},
  notesText: {fontSize:11, color:Theme.colors.text.muted, flex:1, fontStyle:'italic'},
  emptyState: {alignItems:'center', paddingVertical:60},
  emptyIcon: {width:80, height:80, borderRadius:40, backgroundColor:Theme.colors.background.card, alignItems:'center', justifyContent:'center', marginBottom:20},
  emptyTitle: {fontSize:18, fontWeight:'700', color:Theme.colors.text.primary},
  emptySubtitle: {fontSize:14, color:Theme.colors.text.tertiary, marginTop:8, textAlign:'center', paddingHorizontal:40},
  emptyButton: {marginTop:24, borderRadius:Theme.radius.lg, overflow:'hidden'},
  emptyButtonGrad: {flexDirection:'row', alignItems:'center', gap:8, paddingVertical:14, paddingHorizontal:24},
  emptyButtonText: {fontSize:15, fontWeight:'700', color:Theme.colors.background.primary},
  bottomSpacing: {height:120},
});
