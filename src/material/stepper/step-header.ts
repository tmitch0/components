/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewEncapsulation,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {MatStepLabel} from './step-label';
import {MatStepperIntl} from './stepper-intl';
import {MatStepperIconContext} from './stepper-icon';
import {CdkStepHeader, StepState} from '@angular/cdk/stepper';
import {CanColorCtor, mixinColor, CanColor} from '@angular/material/core';


// Boilerplate for applying mixins to MatStepHeader.
/** @docs-private */
class MatStepHeaderBase extends CdkStepHeader {
  constructor(elementRef: ElementRef) {
    super(elementRef);
  }
}

const _MatStepHeaderMixinBase: CanColorCtor & typeof MatStepHeaderBase =
    mixinColor(MatStepHeaderBase, 'primary');

@Component({
  selector: 'mat-step-header',
  templateUrl: 'step-header.html',
  styleUrls: ['step-header.css'],
  inputs: ['color'],
  host: {
    'class': 'mat-step-header',
    'role': 'tab',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatStepHeader extends _MatStepHeaderMixinBase implements AfterViewInit, OnDestroy,
  CanColor {
  private _intlSubscription: Subscription;

  /** State of the given step. */
  @Input() state: StepState;

  /** Label of the given step. */
  @Input() label: MatStepLabel | string;

  /** Error message to display when there's an error. */
  @Input() errorMessage: string;

  /** Overrides for the header icons, passed in via the stepper. */
  @Input() iconOverrides: {[key: string]: TemplateRef<MatStepperIconContext>};

  /** Index of the given step. */
  @Input() index: number;

  /** Whether the given step is selected. */
  @Input() selected: boolean;

  /** Whether the given step label is active. */
  @Input() active: boolean;

  /** Whether the given step is optional. */
  @Input() optional: boolean;

  /** Whether the ripple should be disabled. */
  @Input() disableRipple: boolean;

  constructor(
    public _intl: MatStepperIntl,
    private _focusMonitor: FocusMonitor,
    _elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef) {
    super(_elementRef);
    this._intlSubscription = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true);
  }

  ngOnDestroy() {
    this._intlSubscription.unsubscribe();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Focuses the step header. */
  focus(origin?: FocusOrigin, options?: FocusOptions) {
    if (origin) {
      this._focusMonitor.focusVia(this._elementRef, origin, options);
    } else {
      this._elementRef.nativeElement.focus(options);
    }
  }

  /** Returns string label of given step if it is a text label. */
  _stringLabel(): string | null {
    return this.label instanceof MatStepLabel ? null : this.label;
  }

  /** Returns MatStepLabel if the label of given step is a template label. */
  _templateLabel(): MatStepLabel | null {
    return this.label instanceof MatStepLabel ? this.label : null;
  }

  /** Returns the host HTML element. */
  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  /** Template context variables that are exposed to the `matStepperIcon` instances. */
  _getIconContext(): MatStepperIconContext {
    return {
      index: this.index,
      active: this.active,
      optional: this.optional
    };
  }

  _getDefaultTextForState(state: StepState): string {
    if (state == 'number') {
      return `${this.index + 1}`;
    }
    if (state == 'edit') {
      return 'create';
    }
    if (state == 'error') {
      return 'warning';
    }
    return state;
  }
}
