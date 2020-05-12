import * as R from 'ramda';

() => {
  const Maybe = {
    of,
    isMaybe,
    Just,
    Nothing,
    isJust,
  } as const;

  type NothingType = [] & {
    constructor: typeof Maybe;
    toString(): "Nothing()";
    ['fantasy-land/ap'](arg: any): NothingType;
    isJust: false;
  };

  const NothingTypeRep: NothingType = Object.create({
    ...[],
    constructor: Maybe,
    toString() { return "Nothing()" },
    ['fantasy-land/ap']() { return this },
    isJust: false,
  });

  function Nothing() {
    return NothingTypeRep;
  }

  type JustType<T> = [T] & {
    constructor: typeof Maybe;
    toString(): string;
    ['fantasy-land/ap']<ApType>(arg: JustType<(_: T) => ApType>): NothingType | JustType<ApType>;
    ['fantasy-land/ap']<Other>(arg: Other): Other;
    isJust: true;
  };

  function Just<T>(value: T): JustType<T> {
    return Object.create({
      ...[value],
      constructor: Maybe,
      toString() { return "Just(" + this[0] + ")" },
      ['fantasy-land/ap'](other: any) { return Maybe.isJust(other) ? Just(other[0](this)) : other },
      isJust: true,
    });
  }

  type MaybeType = NothingType | JustType<any>;

  function of<T>(value: T): MaybeType {
    if (Maybe.isMaybe(value)) {
      return value;
    }
    return Just(value);
  }

  function isMaybe(arg: any): arg is MaybeType {
    return arg.constructor === Maybe;
  }

  function isJust(arg: any): arg is JustType<any> {
    return arg.isJust === true;
  }

  R.sequence(Maybe.of, [Just(1), Just(2), Just(3)]);   //=> Just([1, 2, 3])
  R.sequence(Maybe.of, [Just(1), Just(2), Nothing()]); //=> Nothing()

  R.sequence(R.of, Just([1, 2, 3])); //=> [Just(1), Just(2), Just(3)]
  R.sequence(R.of, Nothing());       //=> [Nothing()]
};
